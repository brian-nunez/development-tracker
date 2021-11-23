import { Request, Response, NextFunction } from 'express';
import _debug from 'debug';
import jwt from 'jsonwebtoken';
import { buildErrorMessage, ErrorType } from '../utils/errorBuilder';
import User, { UserShape } from '../models/User';

export interface SessionRequest extends Request {
  session: any,
  user: UserShape,
}

const debug = _debug(`${process.env.npm_package_name}:middleware:authentication`);

export default async function authenticated(request: SessionRequest, response: Response, next: NextFunction) {
  const { JWT_SECRET } = process.env;

  const token: string | undefined = request.session?.authToken;

  if (!token) {
    const error = buildErrorMessage(ErrorType.UNAUTHORIZED);
    debug(`Token not provided - ${JSON.stringify(error)}`);
    response.status(error.http_status_code).json(error.error_message);
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    request.user = user;
    next();
  } catch (err) {
    const error = buildErrorMessage(ErrorType.UNAUTHORIZED);
    debug(`Token not valid - ${token} - ${JSON.stringify(error)}`);
    response.status(error.http_status_code).json(error.error_message);
  }
};