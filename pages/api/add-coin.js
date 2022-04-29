import jwt from 'jsonwebtoken';

import prisma from '../../lib/prisma';
import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import { authGuardHof, postRequestGuardHof } from '../../utils/guards';
import {
  ApiResponseError,
  ApiResponseSuccess,
  RESPONSE_STATUSES,
  ErrorData,
} from '../../utils/responses';
import { getOpenBinanceOrders } from './check-order-statuses';
import { orderStatuses } from '../../utils/constants';

async function fillOpenedCoinOrders({ id, coin }) {
  const binanceOpenOrders = await getOpenBinanceOrders(coin);

  await Promise.all(
    binanceOpenOrders.map((order) => {
      return prisma.order.create({
        data: {
          coinId: id,
          status: orderStatuses.sellInProgress,
          orderParts: {
            create: [
              {
                oneCoinPrice: Number(order.price),
                clientOrderId: order.clientOrderId,
                transactTime: String(order.time),
                fullPrice: Number(order.origQty) * order.price,
                coinsAmount: Number(order.origQty),
                status: order.status,
                type: order.type,
                side: order.side,
              },
            ],
          },
        },
      });
    }),
  );
}

async function handler(req, res) {
  const { coin } = req.body;

  try {
    const timestamp = getTimestamp();
    const query = `timestamp=${timestamp}`;
    const signature = getSignature(query);

    const tokenPayload = await jwt.verify(
      req.cookies?.token || '',
      process.env.JWT_SALT,
    );
    const allCoinsRaw = await fetch(
      `https://api.binance.com/sapi/v1/capital/config/getall?${query}&signature=${signature}`,
      getHeaders(),
    );
    const allCoins = await allCoinsRaw.json();

    const foundCoin = allCoins.find((item) => {
      return item.coin === coin;
    });

    if (foundCoin) {
      const createdToken = await prisma.coin.create({
        data: {
          coin: foundCoin.coin,
          // amount: Number(foundCoin.free) + Number(foundCoin.locked),
          fullCoinName: foundCoin.name,
          userId: tokenPayload.id,
        },
      });

      console.log(createdToken);

      await fillOpenedCoinOrders(createdToken);

      res
        .status(200)
        .json(
          new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, { createdToken }),
        );
    } else {
      res
        .status(500)
        .json(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(500, "Isn't valid coin name!"),
          ),
        );
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(new ApiResponseError());
  }
}

export default postRequestGuardHof(authGuardHof(handler));
