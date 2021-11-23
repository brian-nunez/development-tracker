import { Schema, model, Document } from 'mongoose';
import _debug from 'debug';
import { UserShape } from './User';
import { TaskShape } from './Task';

const debug = _debug(`${process.env.npm_package_name}:models:Story`);

type StoryStatus = 'GROOMING' | 'DEFINED' | "PROGRESS" | 'COMPLETED' | 'ACCEPTED' | 'RELEASED';

export interface StoryShape extends Document {
  name: string,
  owner: UserShape,
  tasks: TaskShape[],
  estimate: number,
  notes: string,
  acceptenceCriteria: string,
  status: StoryStatus,
  dateCreated?: number,
}
