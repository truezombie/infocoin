import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import {
  ApiResponseError,
  ApiResponseSuccess,
  RESPONSE_STATUSES,
  ErrorData,
} from '../../utils/responses';
import { postRequestGuardHof, authGuardHof } from '../../utils/guards';
import { orderTypes, orderStatuses } from '../../utils/constants';
import prisma from '../../lib/prisma';

async function getBinanceCreatedUserOrder(orderId, symbol) {
  const timestamp = getTimestamp();
  const binanceCreatedUserOrderQuery = `symbol=${symbol}USDT&orderId=${orderId}&timestamp=${timestamp}`;
  const binanceCreatedUserOrderSignature = getSignature(
    binanceCreatedUserOrderQuery,
  );
  const binanceCreatedUserOrderRaw = await fetch(
    `https://api.binance.com/api/v3/allOrders?${binanceCreatedUserOrderQuery}&signature=${binanceCreatedUserOrderSignature}`,
    {
      ...getHeaders(),
    },
  );
  const binanceCreatedUserOrder = await binanceCreatedUserOrderRaw.json();

  return binanceCreatedUserOrder;
}

// TODO: need to move somewhere
export async function getCoin(abbreviationCoin, res) {
  try {
    const coin = await await prisma.coin.findUnique({
      where: {
        coin: abbreviationCoin,
      },
    });

    if (!coin) {
      res
        .status(404)
        .json(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(404, 'Coin not found'),
          ),
        );
    }

    return coin;
  } catch (e) {
    res.status(500).json(new ApiResponseError());
  }
}

// TODO: need to move somewhere
export async function createBinanceOrder(symbol, side, type, quantity, price) {
  const timestamp = getTimestamp();
  const isLimitOrder = type === orderTypes.limit;

  const orderTypeQueryParams = isLimitOrder
    ? `type=${orderTypes.limit}&quantity=${quantity}&price=${price}`
    : `type=${orderTypes.market}&quantity=${quantity}`;

  const query = `symbol=${symbol}USDT&side=${side}&${orderTypeQueryParams}&timeInForce=GTC&timestamp=${timestamp}`;
  const signature = getSignature(query);

  const binanceCreateOrderResponseRaw = await fetch(
      `https://api.binance.com/api/v3/order?${query}&signature=${signature}`,
      {
        method: 'POST',
        ...getHeaders(),
      },
    );
  
  const binanceCreateOrderResponse = await binanceCreateOrderResponseRaw.json();
  
  return binanceCreateOrderResponse;
}

async function handler(req, res) {
  const { symbol, side, type, quantity, price, isLimitOrder } = req.body;

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

    const binanceCreatedUserOrder = await getBinanceCreatedUserOrder(
      binanceCreateOrder.orderId,
      symbol,
    );

    const coin = await getCoin(symbol, res);
    const oneCoinPrice = isLimitOrder
      ? Number(binanceCreateOrder.price)
      : Number(binanceCreatedUserOrder[0].price);
    const order = await prisma.order.create({
      data: {
        coinId: coin.id,
        status: orderStatuses.buyInProgress,
        orderParts: {
          create: [
            {
              oneCoinPrice,
              clientOrderId: binanceCreateOrder.clientOrderId,
              transactTime: String(binanceCreateOrder.transactTime),
              fullPrice:
                Number(binanceCreateOrder.origQty) * oneCoinPrice,
              coinsAmount: Number(binanceCreateOrder.origQty),
              status: binanceCreateOrder.status,
              type: binanceCreateOrder.type,
              side: binanceCreateOrder.side,
            },
          ],
        },
      },
    });

    res
      .status(200)
      .json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, order));
  } catch (e) {
    console.log(e);
    res.status(500).json(new ApiResponseError());
  }
}

export default postRequestGuardHof(authGuardHof(handler));
