import { Response } from 'express';
import _debug from 'debug';
import { buildErrorMessage, ErrorResponse, ErrorType } from '../utils/errorBuilder';
import Team, { cleanTeam, populateTeamData, TeamShape, deleteTeamData } from '../models/Team';
import User, { UserShape } from '../models/User';
import { SessionRequest } from '../middleware/authenticated';
import Story, { cleanStory, createUniqueStoryId, deleteStoryData, populateStoryData } from '../models/Story';

const debug = _debug(`${process.env.npm_package_name}:featureController`);

async function handleCreateTeam(request: SessionRequest, response: Response) {
  try {
    const { name, slug } = request.body;

    const foundTeam = await Team.findOne({ slug });

    if (foundTeam) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.INVALID_REQUEST, 'Team already exists');
      debug(`handleCreateTeam: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const user: UserShape = request.user;

    const team = new Team({
      name,
      slug,
      owner: user,
      members: [user],
    });

    await team.save();
    await populateTeamData(team);
    const teamData = cleanTeam(team);

    debug(`Team successfully created - ${JSON.stringify(teamData)}`);

    response.json(teamData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleCreateTeam: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleGetTeam(request: SessionRequest, response: Response) {
  try {
    const { slug } = request.query;
    const user: UserShape = request.user;

    const queryOptions = {
      slug,
      members: {
        '$in': [user],
      },
    };

    const team = await Team.findOne(queryOptions);

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleGetTeam: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    await populateTeamData(team);

    const teamData = cleanTeam(team);

    debug(`Team successfully retrieved - ${JSON.stringify(teamData)}`);

    response.json(teamData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleGetTeam: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleGetUserTeams(request: SessionRequest, response: Response) {
  try {
    const user: UserShape = request.user;

    const queryOptions = {
      members: {
        '$in': [user],
      },
    };

    const teams: TeamShape[] = await Team.find(queryOptions);

    const teamsData = [];
    for(let i = 0; i < teams.length; i++) {
      const team = teams[i];
      await populateTeamData(team);
      const cleanData = cleanTeam(team);
      teamsData.push(cleanData);
    }

    debug(`Teams successfully retrieved - ${JSON.stringify(teamsData)}`);

    response.json(teamsData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleGetUserTeams: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleDeleteTeam(request: SessionRequest, response: Response) {
  try {
    const { slug } = request.body;
    const user: UserShape = request.user;

    const queryOptions = {
      slug,
      owner: user,
    };

    const team = await Team.findOne(queryOptions);

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleDeleteTeam: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    await deleteTeamData(team);
    await Team.deleteOne(queryOptions);

    debug(`Successfully deleted team - ${slug}`);

    response.json({ success: true });
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleGetUserTeams: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleOwnerChange(request: SessionRequest, response: Response) {
  try {
    const { slug, targetUserId } = request.body;
    const user: UserShape = request.user;

    const queryOptions = {
      slug,
      owner: user,
    };

    const team: TeamShape = await Team.findOne(queryOptions);

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleOwnerChange: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const targetUser: UserShape = await User.findOne({ slug, userId: targetUserId });

    if (!targetUser) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'User is not added to this team');
      debug(`handleOwnerChange: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const userAdded = await Team.findOne({
      slug,
      members: {
        '$in': [targetUser],
      },
    });

    if (!userAdded) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'User is not on the team');
      debug(`handleOwnerChange: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    team.owner = targetUser;

    await team.save();
    await populateTeamData(team);
    const teamData = cleanTeam(team);

    response.json(teamData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleOwnerChange: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleAddTeamMember(request: SessionRequest, response: Response) {
  try {
    const { slug, userId } = request.body;
    const user: UserShape = request.user;

    const queryOptions = {
      slug,
      members: {
        '$in': [user],
      },
    };

    const team: TeamShape = await Team.findOne(queryOptions);

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleAddTeamMember: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const targetUser: UserShape = await User.findOne({ userId });

    if (!targetUser) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'User does not exist');
      debug(`handleAddTeamMember: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const userAlreadyAdded = await Team.findOne({
      slug,
      members: {
        '$in': [targetUser],
      },
    });

    if (userAlreadyAdded) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'User is already added to team');
      debug(`handleAddTeamMember: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    team.members.push(targetUser);

    await team.save();
    await populateTeamData(team);
    const teamData = cleanTeam(team);

    response.json(teamData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleAddTeamMember: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleAddStory(request: SessionRequest, response: Response) {
  try {
    const {
      slug,
      name,
    } = request.body;
    const user: UserShape = request.user;

    const queryOptions = {
      slug,
      members: {
        '$in': [user],
      },
    };

    const team = await Team.findOne(queryOptions);

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleAddStory: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const story = new Story({
      name,
      storyId: await createUniqueStoryId(),
      owner: user,
      tasks: [],
      estimate: 0,
      notes: '',
      acceptenceCriteria: '',
    });

    await story.save();
    team.backlog.push(story);
    await team.save();

    const storyData = cleanStory(story);

    response.json(storyData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleAddStory: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleDeleteStory(request: SessionRequest, response: Response) {
  try {
    const { slug, storyId } = request.body;
    const user: UserShape = request.user;

    const story = await Story.findOne({ storyId });

    if (!story) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Story does not exist');
      debug(`handleDeleteStory: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const team = await Team.findOne({
      slug,
      members: {
        '$in': [user],
      },
      backlog: {
        '$in': [story],
      },
    });

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleDeleteStory: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    await deleteStoryData(story);
    await Story.deleteOne({ storyId: story.storyId });


    response.json({ success: true });
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleDeleteStory: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleStoryUpdate(request: SessionRequest, response: Response) {
  try {
    const {
      slug,
      storyId,
      name,
      estimate,
      notes,
      acceptenceCriteria,
      status,
    } = request.body;
    const user: UserShape = request.user;

    const story = await Story.findOne({ storyId });

    if (!story) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Story does not exist');
      debug(`handleStoryUpdate: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const team = await Team.findOne({
      slug,
      members: {
        '$in': [user],
      },
      backlog: {
        '$in': [story],
      },
    });

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Team does not exist');
      debug(`handleDeleteStory: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    if (name) {
      story.name = name;
    }
    if (estimate) {
      story.estimate = estimate;
    }
    if (notes) {
      story.notes = notes;
    }
    if (acceptenceCriteria) {
      story.acceptenceCriteria = acceptenceCriteria;
    }
    if (status) {
      story.status = status;
    }

    await story.save();

    await populateStoryData(story);
    const cleanedStory = cleanStory(story);


    response.json(cleanedStory);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleStoryUpdate: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

export default {
  handleCreateTeam,
  handleGetTeam,
  handleGetUserTeams,
  handleDeleteTeam,
  handleOwnerChange,
  handleAddTeamMember,
  handleAddStory,
  handleDeleteStory,
  handleStoryUpdate,
};
