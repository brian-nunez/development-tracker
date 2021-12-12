import { Schema, model, Document } from 'mongoose';
import _debug from 'debug';
import { cleanUser, UserShape } from './User';
import Story, { cleanStory, StoryShape } from './Story';
import generateRandomString from '../utils/generateRandomString';

const debug = _debug(`${process.env.npm_package_name}:models:Feature`);

export interface FeatureShape extends Document {
  name: string,
  featureId: string,
  owner: UserShape,
  stories: StoryShape[],
  dateCreated?: number,
}

const FeatureSchema = new Schema<FeatureShape>({
  name: {
    type: String,
    required: true,
  },
  featureId: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stories: {
    type: [Schema.Types.ObjectId],
    ref: 'Story',
    default: [],
  },
  dateCreated: {
    type: Number,
    default: Date.now,
  },
});

const Feature = model<FeatureShape>('Feature', FeatureSchema);

export async function populateFeatureData(feature: FeatureShape): Promise<void> {
  const fieldsToPopulate = ['owner'];

  if (feature.stories.length > 0) {
    fieldsToPopulate.push('stories');
  }

  await feature.populate(fieldsToPopulate);
}

export async function createUniqueFeatureId(): Promise<string> {
  const id = generateRandomString(10);
  const story = await Feature.findOne({ featureId: id });

  if (story) {
    return createUniqueFeatureId();
  }

  return id;
}

export function cleanFeature(feature: FeatureShape) {
  const {
    name,
    featureId,
    owner,
    stories,
  } = feature;

  return {
    name,
    featureId,
    owner:  cleanUser(owner),
    stories: stories.map(story => cleanStory(story)),
  };
}

export async function deleteFeatureData(feature: FeatureShape): Promise<void> {
  function idsToRegex(array: any[], idProp: string): RegExp {
    const ids = array.map(s => s[idProp]).join('|');
    return new RegExp(`${ids}`, 'g');
  }

  const storyRegex: RegExp = idsToRegex(feature.stories, 'storyId');

  await Story.deleteMany({
    storyId: storyRegex,
  });

  await feature.save();
}

export default Feature;
