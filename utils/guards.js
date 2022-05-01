import jwt from 'jsonwebtoken';

import {
  defaultNotAuthorizedError,
  defaultNotPostRequestError,
  ApiResponseError,
  RESPONSE_STATUSES,
  ErrorData,
} from './responses';

export function localhostRequestGuardHof(handler) {
  return (req, res) => {
    if (!req.headers.host.includes(process.env.APP_LOCALHOST_URL)) {
      res
        .status(405)
        .send(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(405, 'Only localhost requests allowed'),
          ),
        );
      return;
    }

    handler(req, res);
  };
}

export function postRequestGuardHof(handler) {
  return (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send(defaultNotPostRequestError);
      return;
    }

    handler(req, res);
  };
}

export function authGuardHof(handler) {
  return async (req, res) => {
    try {
      await jwt.verify(req.cookies?.token || '', process.env.APP_JWT_SALT);

      handler(req, res);
    } catch (e) {
      res.status(401).json(defaultNotAuthorizedError);
    }
  };
}
