import { Schema, model, Document } from 'mongoose';
import _debug from 'debug';
import { UserShape } from './User';

const debug = _debug(`${process.env.npm_package_name}:models:Task`);

export type TaskStatus = 'DEFINED' | "PROGRESS" | 'COMPLETED';

export interface TaskShape extends Document {
  name: string,
  owner: UserShape,
  status: TaskStatus,
  hours: number,
  dateCreated?: number,
}
