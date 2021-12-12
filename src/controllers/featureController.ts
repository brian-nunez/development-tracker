import { Response } from 'express';
import _debug from 'debug';
import { buildErrorMessage, ErrorResponse, ErrorType } from '../utils/errorBuilder';
import { SessionRequest } from '../middleware/authenticated';
import { UserShape } from '../models/User';
import Team, { populateTeamData } from '../models/Team';
import Feature, { cleanFeature, createUniqueFeatureId, deleteFeatureData, populateFeatureData } from '../models/Feature';

const debug = _debug(`${process.env.npm_package_name}:featureController`);

async function handleCreateFeature(request: SessionRequest, response: Response) {
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
      debug(`handleCreateFeature: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const feature = new Feature({
      name,
      featureId: await createUniqueFeatureId(),
      owner: user,
      stories: [],
    });

    await feature.save();

    team.features.push(feature);

    await team.save();
    await populateFeatureData(feature);
    const featureData = cleanFeature(feature);

    response.json(featureData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleStoryUpdate: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleGetFeature(request: SessionRequest, response: Response) {
  try {
    const { slug, featureId } = request.query;

    const queryOptions = {
      slug,
      featureId,
    };

    const feature = await Feature.findOne(queryOptions);

    if (!feature) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Feature does not exist');
      debug(`handleGetFeature: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    await populateFeatureData(feature);
    const cleanedData = cleanFeature(feature);

    response.json(cleanedData);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleGetFeature: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleGetAllFeatures(request: SessionRequest, response: Response) {
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
      debug(`handleGetAllFeatures: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    await populateTeamData(team);
    const features = [];

    for (let feature of team.features) {
      await populateFeatureData(feature);
      const cleanedData = cleanFeature(feature);
      features.push(cleanedData);
    }

    response.json(features);
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleGetAllFeatures: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleDeleteFeature(request: SessionRequest, response: Response) {
  try {
    const { slug, featureId } = request.body;

    const queryOptions = {
      featureId,
    };

    const feature = await Feature.findOne(queryOptions);

    if (!feature) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Feature does not exist');
      debug(`handleDeleteFeature: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const team = await Team.findOne({
      slug,
      features: {
        '$in': [feature],
      },
    });

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_ALLOWED, 'Not Allowed to delete!');
      debug(`handleDeleteFeature: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    await deleteFeatureData(feature);
    await Feature.deleteOne(queryOptions);

    response.json({ success: true });
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleGetAllFeatures: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleFeatureUpdate(request: SessionRequest, response: Response) {
  try {
    const { slug, featureId } = request.body;

    const queryOptions = {
      featureId,
    };

    const feature = await Feature.findOne(queryOptions);

    if (!feature) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'Feature does not exist');
      debug(`handleFeatureUpdate: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const team = await Team.findOne({
      slug,
      features: {
        '$in': [feature],
      },
    });

    if (!team) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_ALLOWED, 'Not Allowed to delete!');
      debug(`handleDeleteFeature: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleFeatureUpdate: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

export default {
  handleCreateFeature,
  handleGetFeature,
  handleGetAllFeatures,
  handleDeleteFeature,
};
