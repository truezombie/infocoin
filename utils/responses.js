export const RESPONSE_STATUSES = {
  SUCCESS: 'OK',
  ERROR: 'ERROR',
};
export class ApiResponse {
  constructor(status, data) {
    this.status = status;
    this.data = data;
  }
}

export class ErrorData {
  constructor(code = 500, message = 'Internal server error') {
    this.code = code;
    this.message = message;
  }
}

export class ApiResponseError extends ApiResponse {
  constructor(status = RESPONSE_STATUSES.ERROR, data = new ErrorData()) {
    super(status, data);
  }
}

export class ApiResponseSuccess extends ApiResponse {
  constructor(status = RESPONSE_STATUSES.SUCCESS, data) {
    super(status, data);
  }
}

export const defaultNotPostRequestError = new ApiResponseError(
  RESPONSE_STATUSES.ERROR,
  new ErrorData(405, 'Only POST requests allowed'),
);

export const defaultNotAuthorizedError = new ApiResponseError(
  RESPONSE_STATUSES.ERROR,
  new ErrorData(401, 'Not authorized!'),
);
