import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { buildErrorMessage, ErrorResponse, ErrorType } from '../utils/errorBuilder';

function handleValidations(request: Request, response: Response, next: NextFunction) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INVALID_REQUEST);
    next(error);
  } else {
    next();
  }
}

export default handleValidations;
