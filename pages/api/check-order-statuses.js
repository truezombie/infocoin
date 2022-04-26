import { STABLE_COIN } from '../../utils/constants';
import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import { ApiResponseError, ApiResponseSuccess } from '../../utils/responses';
import { orderStatuses, orderPartStatuses } from '../../utils/constants';
import { localhostRequestGuardHof } from '../../utils/guards';
import { postMessageToTelegram } from '../../services/telegram';
import prisma from '../../lib/prisma';

export const getOpenBinanceOrders = async (symbol) => {
  const timestamp = getTimestamp();
  const currentSymbol = symbol ? `symbol=${symbol}${STABLE_COIN}` : '';
  const query = `${currentSymbol}&timestamp=${timestamp}`;
  const signature = getSignature(query);

  const ordersRaw = await fetch(
    `https://api.binance.com/api/v3/openOrders?${query}&signature=${signature}`,
    getHeaders(),
  );
  const orders = await ordersRaw.json();

  return orders;
};

const getAllTokens = async () => {
  const coins = await prisma.coin.findMany({
    include: {
      orders: {
        where: {
          status: {
            in: [orderStatuses.buyInProgress, orderStatuses.sellInProgress],
          },
        },
        include: {
          orderParts: {
            where: {
              status: {
                in: [orderPartStatuses.new],
              },
            },
          },
        },
      }
    }
  });

  return coins;
};

const fetchOrderByClientOrderId = async (symbol, clientOrderId) => {
  const timestamp = getTimestamp();
  const currentSymbol = symbol ? `symbol=${symbol}${STABLE_COIN}` : '';
  const query = `${currentSymbol}&origClientOrderId=${clientOrderId}&timestamp=${timestamp}`;
  const signature = getSignature(query);

  const ordersRaw = await fetch(
    `https://api.binance.com/api/v3/order?${query}&signature=${signature}`,
    getHeaders(),
  );
  const orders = await ordersRaw.json();

  return orders;
};

const closeOrders = (tokens, binanceOrders) => {
  tokens.forEach(({ coin, orders }) => {
    orders.forEach(({ orderParts }) => {
      orderParts.forEach(async (orderPart) => {
        const orderInProgress = binanceOrders.find(
          (binanceOrder) => orderPart.clientOrderId === binanceOrder.clientOrderId,
        );

        if (!orderInProgress) {
          // order it's a variable consist closed or filled order
          const order = await fetchOrderByClientOrderId(
            coin, 
            orderPart.clientOrderId,
          );

          await postMessageToTelegram(`Order type ${order.type} of symbol ${order.symbol} was closed with status ${order.status}.`);

          console.log('WAS CLOSED!', order);
        }
      })
    })
  })
};

async function handler(req, res) {
  try {
    const binanceOpenOrders = await getOpenBinanceOrders();
    const tokens = await getAllTokens();

    closeOrders(tokens, binanceOpenOrders);

    res.status(200).json(new ApiResponseSuccess(200, {}));
  } catch (e) {
    res.status(500).send(new ApiResponseError());
  } finally {
    console.log('check-order-statuses');
  }

  /*
    1) + Get my BUY_IN_PROGRESS, SELL_IN_PROGRESS orders
    2) + Get all open order from binance
    3) Close all local order parts which don't match with open orders
    4) Mark tile that was close sell or buy
    5) Change order status
    6) Send telegram message
  */
}

export default localhostRequestGuardHof(handler);
