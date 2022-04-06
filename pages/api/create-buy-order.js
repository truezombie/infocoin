import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import { ApiError } from '../../utils/error';
import { orderTypes } from '../../utils/constants';
import prisma from '../../lib/prisma';

async function getBinanceCreatedUserOrder(orderId) {
  const binanceCreatedUserOrderQuery = `symbol=${symbol}USDT&orderId=${orderId}&timestamp=${timestamp}`;
  const binanceCreatedUserOrderSignature = getSignature(binanceCreatedUserOrderQuery);
  const binanceCreatedUserOrderRaw = await fetch(`https://api.binance.com/api/v3/allOrders?${binanceCreatedUserOrderQuery}&signature=${binanceCreatedUserOrderSignature}`, {
    ...getHeaders()
  });
  const binanceCreatedUserOrder = await binanceCreatedUserOrderRaw.json();

  return binanceCreatedUserOrder;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const { 
    symbol,
    side,
    type,
    quantity,
    price,
  } = req.body;
  const timestamp = getTimestamp();
  const isLimitOrder = type === orderTypes.limit;

  const orderTypeQueryParams = isLimitOrder ? 
    `type=${orderTypes.limit}&quantity=${quantity}&price=${price}` : 
    `type=${orderTypes.market}&quantity=${quantity}`;

  const query = `symbol=${symbol}USDT&side=${side}&${orderTypeQueryParams}&timeInForce=GTC&timestamp=${timestamp}`;
  const signature = getSignature(query);

  try {
    const binanceCreateOrderResponseRaw = await fetch(`https://api.binance.com/api/v3/order?${query}&signature=${signature}`, {
      method: 'POST',
      ...getHeaders(),
    });
    const binanceCreateOrderResponse = await binanceCreateOrderResponseRaw.json();

    if (binanceCreateOrderResponse?.code && binanceCreateOrderResponse?.msg) {
      res.status(500).json(new ApiError(binanceCreateOrderResponse?.code, binanceCreateOrderResponse?.msg));
    }

    const binanceCreatedUserOrder = await getBinanceCreatedUserOrder(211737897); // TODO: need to replace id
    const order = await prisma.order.create({
      data: {
        status: 'BUY_IN_PROGRESS',
        orderParts: {
          create: [{
            symbol: symbol,
            clientOrderId: binanceCreateOrderResponse.clientOrderId,
            transactTime: binanceCreateOrderResponse.transactTime,
            fullPrice: Number(binanceCreateOrderResponse.origQuoteOrderQty),
            coinsAmount: Number(binanceCreateOrderResponse.origQty),
            oneCoinPrice: isLimitOrder ? Number(binanceCreateOrderResponse.price) : Number(binanceCreatedUserOrder[0].price),
            status: binanceCreateOrderResponse.status,
            type: binanceCreateOrderResponse.type,
            side: binanceCreateOrderResponse.side,
          }],
        }
      }
    });

    res.status(200).json({
      status: 'OK',
      data: order
    })
  } catch(e) {
    console.log(e);
    res.status(500).json(new ApiError());
  }
}
