import { Schema, model, Document } from 'mongoose';
import _debug from 'debug';
import { UserShape } from './User';
import { StoryShape } from './Story';

const debug = _debug(`${process.env.npm_package_name}:models:Feature`);

export interface FeatureShape extends Document {
  name: string,
  owner: UserShape,
  stories: StoryShape[],
  dateCreated?: number,
}
