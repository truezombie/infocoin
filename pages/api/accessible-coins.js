import { ApiResponseSuccess, RESPONSE_STATUSES } from '../../utils/responses';
import { authGuardHof } from '../../utils/guards';
import prisma from '../../lib/prisma';

async function handler(req, res) {
  // TODO: error handling and pagination

  const coins = await prisma.coin.findMany();

  res
    .status(200)
    .json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, { coins }));
}

export default authGuardHof(handler);
