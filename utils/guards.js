import jwt from 'jsonwebtoken';

import {
  defaultNotAuthorizedError,
  defaultNotPostRequestError,
} from './responses';

export function localhostRequestGuardHof(handler) {
  return (req, res) => {
    if (!req.headers.host.includes(process.env.LOCALHOST_URL)) {
      res
        .status(405)
        .send(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(405, 'Only localhost requests allowed')
          )
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
      const payload = await jwt.verify(
        req.cookies?.token || '',
        process.env.JWT_SALT
      );

      handler(req, res);
    } catch (e) {
      console.log(e);
      res.status(401).json(defaultNotAuthorizedError);
    }
  };
}
