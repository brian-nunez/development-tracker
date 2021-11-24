import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import _debug from 'debug';
import { cleanUser, UserShape } from './User';
import { FeatureShape } from './Feature';
import Story, { cleanStory, StoryShape } from './Story';

const debug = _debug(`${process.env.npm_package_name}:models:Team`);

export interface TeamShape extends Document {
  slug: string,
  name: string,
  owner: UserShape,
  features?: FeatureShape[],
  members?: UserShape[],
  backlog?: StoryShape[],
  dateCreated?: number,
}

const TeamSchema = new Schema<TeamShape>({
  slug: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  features: {
    type: [Schema.Types.ObjectId],
    ref: 'Feature',
    default: [],
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  backlog: {
    type: [Schema.Types.ObjectId],
    ref: 'Story',
    default: [],
  },
  dateCreated: {
    type: Number,
    default: Date.now,
  },
});

export async function populateTeamData(team: TeamShape): Promise<void> {
  const fieldsToPopulate = ['members', 'owner'];

  if (team.features.length > 0) {
    fieldsToPopulate.push('features');
  }

  if (team.backlog.length > 0) {
    fieldsToPopulate.push('backlog');
  }

  await team.populate(fieldsToPopulate);
}

export async function deleteTeamData(team: TeamShape): Promise<void> {
  // TODO: delete features
  const storyIds: string = team.backlog.map(s => s.storyId).join('|');
  
  await Story.deleteMany({
    storyId: new RegExp(`${storyIds}`, 'g'),
  });

  await team.save();
}

export function cleanTeam(team: TeamShape) {
  const {
    _id: id,
    slug,
    name,
    owner,
    features,
    members,
    backlog,
  } = team;

  return {
    id,
    slug,
    name,
    owner: cleanUser(owner),
    features,
    members: members.map(member => cleanUser(member)),
    backlog: backlog.map(story => cleanStory(story)),
  }
}

export default model<TeamShape>('Team', TeamSchema);
