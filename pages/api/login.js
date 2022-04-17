import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

import {
  ApiResponseError,
  ApiResponseSuccess,
  ErrorData,
  RESPONSE_STATUSES,
} from '../../utils/responses';
import { postRequestGuardHof } from '../../utils/guards';
import prisma from '../../lib/prisma';

async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

async function handler(req, res) {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);

  if (!user) {
    return res
      .status(404)
      .send(
        new ApiResponseError(
          RESPONSE_STATUSES.ERROR,
          new ErrorData(404, 'User not found!')
        )
      );
  } else if (password !== user.password) {
    return res
      .status(401)
      .send(
        new ApiResponseError(
          RESPONSE_STATUSES.ERROR,
          new ErrorData(401, "Password isn't correct!")
        )
      );
  } else {
    const { id, nickName } = user;

    const token = jwt.sign({ id, nickName }, process.env.JWT_SALT, {
      expiresIn: process.env.JWT_TTL,
    });

    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 1,
      })
    );

    res
      .status(200)
      .json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, { token }));
  }
}

export default postRequestGuardHof(handler);
