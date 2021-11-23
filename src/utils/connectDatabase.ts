import mongoose, { Mongoose } from 'mongoose';
import _debug from 'debug';
import { buildErrorMessage, ErrorType } from './errorBuilder';

const debug = _debug(`${process.env.npm_package_name}:connectDatabase`);

async function connectDatabase(): Promise<Mongoose> {
  try {
    const connection: Mongoose = await mongoose.connect(process.env.MONGO_DATABASE_URI);

    debug('Database connected');

    return connection;
  } catch (e) {
    const error = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR, 'Could not connect to database');
    debug(error);
    throw new Error(error.error_message.error_message);
  }
}

export default connectDatabase;
