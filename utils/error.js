export class ApiError extends Error {
  constructor(code = 500, message = 'Internal server error') {
    super();

    this.status = 'ERROR';
    this.data = {
      code,
      message
    }
  }
}