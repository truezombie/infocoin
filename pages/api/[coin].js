import { getTimestamp, getSignature, getHeaders } from '../../utils/api';

export default async function handler(req, res) {
  const { coin } = req.query;
  const timestamp = getTimestamp();
  const query = `symbol=${coin}USDT&timestamp=${timestamp}`;
  const signature = getSignature(query);

  const rawMyTrades = await fetch(`https://api.binance.com/api/v3/myTrades?${query}&signature=${signature}`, getHeaders());
  const rawAllOrders = await fetch(`https://api.binance.com/api/v3/allOrders?${query}&signature=${signature}`, getHeaders())

  const myTrades = await rawMyTrades.json();
  const allOrders = await rawAllOrders.json();

  const trades = myTrades.map((myTrade) => {
    const order = allOrders.find((order) => (order.orderId === myTrade.orderId) && order.status === 'FILLED');

    return {
      myTrade,
      order
    }
  });

  res.status(200).json(trades);
}
