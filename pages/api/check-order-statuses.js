import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import { ApiResponseError, ApiResponseSuccess } from '../../utils/responses';
import { orderStatuses, orderPartStatuses } from '../../utils/constants';
import { localhostRequestGuardHof, authGuardHof } from '../../utils/guards';
import prisma from '../../lib/prisma';

const getOpenBinanceOrders = async () => {
  const timestamp = getTimestamp();
  const query = `timestamp=${timestamp}`;
  const signature = getSignature(query);

  const ordersRaw = await fetch(
    `https://api.binance.com/api/v3/openOrders?${query}&signature=${signature}`,
    getHeaders()
  );
  const orders = await ordersRaw.json();

  return orders;
};

const getInProgressUserOrders = async () => {
  const orders = await prisma.order.findMany({
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
  });

  return orders;
};

async function handler(req, res) {
  try {
    const binanceOpenOrders = await getOpenBinanceOrders();
    const localInProgressOrders = await getInProgressUserOrders();

    console.log(localInProgressOrders, binanceOpenOrders);

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

export default localhostRequestGuardHof(authGuardHof(handler));
