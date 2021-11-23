import { NextFunction, Request, Response } from 'express';
import _debug from 'debug';
import { ErrorResponse } from '../utils/errorBuilder';

const debug = _debug(`${process.env.npm_package_name}:middleware:handleErrors`);

function handleErrors(error: ErrorResponse, request: Request, response: Response, next: NextFunction) {
  debug(JSON.stringify(error));
  response.status(error.http_status_code).send(error.error_message);
}

export default handleErrors;
