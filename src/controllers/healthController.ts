import { Request, Response } from 'express';
import _debug from 'debug';
import { buildErrorMessage, ErrorType } from '../utils/errorBuilder';

const debug = _debug(`${process.env.npm_package_name}:healthController`);

async function handleHealthCheck(request: Request, response: Response) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    const error = buildErrorMessage(ErrorType.SERVICE_UNAVAILABLE, 'Maintenance in progress', 'MAINTENANCE_MODE');
    debug(JSON.stringify(error));
    response.status(error.http_status_code).json(error.error_message);
    return;
  }
  response.json({
    uptime: process.uptime(),
    message: 'OK',
    date: new Date(),
  });
}

export default {
  handleHealthCheck,
};
