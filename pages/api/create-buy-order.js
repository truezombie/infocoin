import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import {
  ApiResponseError,
  ApiResponseSuccess,
  RESPONSE_STATUSES,
  ErrorData,
} from '../../utils/responses';
import { postRequestGuardHof, authGuardHof } from '../../utils/guards';
import { orderTypes } from '../../utils/constants';
import prisma from '../../lib/prisma';

async function getBinanceCreatedUserOrder(orderId, symbol) {
  const timestamp = getTimestamp();
  const binanceCreatedUserOrderQuery = `symbol=${symbol}USDT&orderId=${orderId}&timestamp=${timestamp}`;
  const binanceCreatedUserOrderSignature = getSignature(
    binanceCreatedUserOrderQuery
  );
  const binanceCreatedUserOrderRaw = await fetch(
    `https://api.binance.com/api/v3/allOrders?${binanceCreatedUserOrderQuery}&signature=${binanceCreatedUserOrderSignature}`,
    {
      ...getHeaders(),
    }
  );
  const binanceCreatedUserOrder = await binanceCreatedUserOrderRaw.json();

  return binanceCreatedUserOrder;
}

async function getCoin(abbreviationCoin) {
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
            new ErrorData(404, 'Coin not found')
          )
        );
    }

    return coin;
  } catch (e) {
    res.status(500).json(new ApiResponseError());
  }
}

async function handler(req, res) {
  const { symbol, side, type, quantity, price } = req.body;
  const timestamp = getTimestamp();
  const isLimitOrder = type === orderTypes.limit;

  const orderTypeQueryParams = isLimitOrder
    ? `type=${orderTypes.limit}&quantity=${quantity}&price=${price}`
    : `type=${orderTypes.market}&quantity=${quantity}`;

  const query = `symbol=${symbol}USDT&side=${side}&${orderTypeQueryParams}&timestamp=${timestamp}`;
  const signature = getSignature(query);

  try {
    const binanceCreateOrderResponseRaw = await fetch(
      `https://api.binance.com/api/v3/order?${query}&signature=${signature}`,
      {
        method: 'POST',
        ...getHeaders(),
      }
    );
    const binanceCreateOrderResponse =
      await binanceCreateOrderResponseRaw.json();

    if (binanceCreateOrderResponse?.code && binanceCreateOrderResponse?.msg) {
      res
        .status(500)
        .json(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(
              binanceCreateOrderResponse?.code,
              binanceCreateOrderResponse?.msg
            )
          )
        );
    }

    const binanceCreatedUserOrder = await getBinanceCreatedUserOrder(
      binanceCreateOrderResponse.orderId,
      symbol
    );

    const coin = await getCoin(symbol);
    const oneCoinPrice = isLimitOrder
      ? Number(binanceCreateOrderResponse.price)
      : Number(binanceCreatedUserOrder[0].price);
    const order = await prisma.order.create({
      data: {
        coinId: coin.id,
        status: 'BUY_IN_PROGRESS',
        orderParts: {
          create: [
            {
              oneCoinPrice,
              clientOrderId: binanceCreateOrderResponse.clientOrderId,
              transactTime: String(binanceCreateOrderResponse.transactTime),
              fullPrice:
                Number(binanceCreateOrderResponse.origQty) * oneCoinPrice,
              coinsAmount: Number(binanceCreateOrderResponse.origQty),
              status: binanceCreateOrderResponse.status,
              type: binanceCreateOrderResponse.type,
              side: binanceCreateOrderResponse.side,
            },
          ],
        },
      },
    });

    res.status(200).json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, order));
  } catch (e) {
    console.log(e)
    res.status(500).json(new ApiResponseError());
  }
}

export default postRequestGuardHof(authGuardHof(handler));
