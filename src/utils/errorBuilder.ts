enum ErrorType {
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  NOT_ALLOWED = 'NOT_ALLOWED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

type ErrorResponse = {
  http_status_code: number,
  error_message: {
    error_code: string,
    error_message: string,
    error_type?: string,
  },
};

type Errors = {
  [id in ErrorType]: ErrorResponse;
};

const errorConstants: Errors = {
  INVALID_REQUEST: {
    http_status_code: 400,
    error_message: {
      error_code: 'INVALID_REQUEST',
      error_message: 'Invalid Request',
    },
  },
  UNAUTHORIZED: {
    http_status_code: 401,
    error_message: {
      error_code: 'UNAUTHORIZED',
      error_message: 'Unauthorized',
    },
  },
  NOT_FOUND: {
    http_status_code: 404,
    error_message: {
      error_code: 'NOT_FOUND',
      error_message: 'Not Found',
    },
  },
  NOT_ALLOWED: {
    http_status_code: 405,
    error_message: {
      error_code: 'NOT_ALLOWED',
      error_message: 'Not Allowed',
    },
  },
  INTERNAL_SERVER_ERROR: {
    http_status_code: 500,
    error_message: {
      error_code: 'INTERNAL_SERVER_ERROR',
      error_message: 'Internal Server Error',
    },
  },
  SERVICE_UNAVAILABLE: {
    http_status_code: 503,
    error_message: {
      error_code: 'SERVICE_UNAVAILABLE',
      error_message: 'Service Unavailable',
    },
  },
};

function buildErrorMessage(
  error: ErrorType,
  message?: string | undefined,
  type?: string | undefined
): ErrorResponse {
  let errorObject: ErrorResponse = errorConstants[error];
  if (typeof message !== 'undefined') {
    errorObject.error_message.error_message = message;
  }
  if (typeof type !== 'undefined') {
    errorObject.error_message.error_type = type;
  }
  return errorObject;
}

export {
  buildErrorMessage,
  ErrorType,
  ErrorResponse,
};