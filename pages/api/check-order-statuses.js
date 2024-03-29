import { STABLE_COIN } from '../../utils/constants';
import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import { ApiResponseError, ApiResponseSuccess } from '../../utils/responses';
import {
  orderStatuses,
  orderPartStatuses,
  orderSides,
} from '../../utils/constants';
import { localhostRequestGuardHof } from '../../utils/guards';
import { postMessageToTelegram } from '../../services/telegram';
import prisma from '../../lib/prisma';

const updateOrderPartStatus = async (id, status) => {
  await prisma.orderPart.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

export const updateOrderStatus = async (id, status) => {
  await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

const markUpdatedCoin = async (coin) => {
  await prisma.coin.update({
    where: {
      coin,
    },
    data: {
      wasUpdated: true
    },
  });
}

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
      },
    },
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

const precessClosedOrder = async (coin, orderId, orderPartId, clientOrderId) => {
  const order = await fetchOrderByClientOrderId(coin, clientOrderId);

  if (order.status === orderPartStatuses.canceled) {
    // TODO: need to decide what i need todo when user close order on Binance side
    await postMessageToTelegram(
      `Order for coin ${coin} was closed and deleted from the infocoin system!`,
    );
  }

  if (
    order.status === orderPartStatuses.filled &&
    order.side === orderSides.buy
  ) {
    await Promise.all([
      markUpdatedCoin(coin),
      updateOrderStatus(orderId, orderStatuses.buyDone),
      updateOrderPartStatus(orderPartId, orderPartStatuses.filled),
      postMessageToTelegram(`Was buy ${order.origQty} ${coin}`),
    ]);
  }

  if (
    order.status === orderPartStatuses.filled &&
    order.side === orderSides.sell
  ) {
    await Promise.all([
      markUpdatedCoin(coin),
      updateOrderStatus(orderId, orderStatuses.sellDone),
      updateOrderPartStatus(orderPartId, orderPartStatuses.filled),
      postMessageToTelegram(`Was sell ${order.origQty} ${coin}`),
    ]);
  }
};

const closeOrders = async (tokens, binanceOrders) => {
  const ordersWillDone = [];

  tokens.forEach(({ coin, orders }) => {
    orders.forEach((order) => {
      order.orderParts.forEach((orderPart) => {
        const orderInProgress = binanceOrders.find(
          (binanceOrder) =>
            orderPart.clientOrderId === binanceOrder.clientOrderId,
        );

        if (!orderInProgress) {
          ordersWillDone.push(precessClosedOrder(coin, order.id, orderPart.id, orderPart.clientOrderId));
        }
      });
    });
  });

  await Promise.all(ordersWillDone);
};

async function handler(req, res) {
  try {
    const binanceOpenOrders = await getOpenBinanceOrders();
    const tokens = await getAllTokens();

    await closeOrders(tokens, binanceOpenOrders);

    res.status(200).json(new ApiResponseSuccess(200, {}));
  } catch (e) {
    console.log(e);
    res.status(500).send(new ApiResponseError());
  } finally {
    console.log('check-order-statuses');
  }
}

export default localhostRequestGuardHof(handler);
