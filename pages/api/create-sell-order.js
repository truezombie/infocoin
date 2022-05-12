import { createBinanceOrder } from './create-buy-order';
import {
  ApiResponseError,
  ApiResponseSuccess,
  RESPONSE_STATUSES,
  ErrorData,
} from '../../utils/responses';
import {
  orderStatuses,
} from '../../utils/constants';
import { postRequestGuardHof, authGuardHof } from '../../utils/guards';
import { updateOrderStatus } from './check-order-statuses';
import prisma from '../../lib/prisma';

async function handler(req, res) {
  const { symbol, side, type, quantity, price, orderId } = req.body;

  try {
    const binanceCreateOrder = await createBinanceOrder(symbol, side, type, quantity, price);

    if (binanceCreateOrder?.code && binanceCreateOrder?.msg) {
      res
        .status(500)
        .json(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(
              binanceCreateOrder?.code,
              binanceCreateOrder?.msg,
            ),
          ),
        );
    }

    await prisma.orderPart.create({
      data: {
        oneCoinPrice: Number(binanceCreateOrder.price),
        clientOrderId: binanceCreateOrder.clientOrderId,
        transactTime: String(binanceCreateOrder.transactTime),
        fullPrice:
          Number(binanceCreateOrder.origQty) * Number(binanceCreateOrder.price),
        coinsAmount: Number(binanceCreateOrder.origQty),
        status: binanceCreateOrder.status,
        type: binanceCreateOrder.type,
        side: binanceCreateOrder.side,
        orderId,
      }
    });

    await updateOrderStatus(orderId, orderStatuses.buyInProgress);

    res
    .status(200)
    .json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, {}));
  } catch (e) {
    console.log(e);
    res.status(500).json(new ApiResponseError());
  }
}

export default postRequestGuardHof(authGuardHof(handler));