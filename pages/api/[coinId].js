import prisma from '../../lib/prisma';
import { authGuardHof } from '../../utils/guards';
import { ApiResponseSuccess, RESPONSE_STATUSES } from '../../utils/responses';

async function handler(req, res) {
  // TODO: error handling and pagination

  const { coinId } = req.query;

  const coin = await prisma.coin.findUnique({
    where: {
      id: coinId,
    },
    include: {
      orders: {
        include: {
          orderParts: true,
        },
      },
    },
  });

  if (coin.wasUpdated) {
    await prisma.coin.update({
      where: {
        id: coin.id
      },
      data: {
        wasUpdated: false,
      },
    });
  }

  res
    .status(200)
    .json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, { coin }));
}

export default authGuardHof(handler);
