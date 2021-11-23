import { Request, Response } from 'express';
import _debug from 'debug';
import { buildErrorMessage, ErrorType } from '../utils/errorBuilder';

const debug = _debug(`${process.env.npm_package_name}:notFound`);

function notFound(request: Request, response: Response) {
  const error = buildErrorMessage(ErrorType.NOT_FOUND, `Route Not Found - ${request.originalUrl}`);
  debug(JSON.stringify(error));
  response.status(error.http_status_code).json(error.error_message)
}

export default notFound;
