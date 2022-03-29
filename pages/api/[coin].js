import crypto from 'crypto';

function getTimestamp() {
  return new Date().getTime();
}

function getSignature(query_string) {
  return crypto.createHmac('sha256', process.env.BINANCE_API_SECRET).update(query_string).digest("hex");
}

export default async function handler(req, res) {
  const { coin } = req.query;
  const timestamp = getTimestamp();
  const query = `symbol=${coin}USDT&timestamp=${timestamp}`;
  const signature = getSignature(query);

  const rawMyTrades = await fetch(`https://api.binance.com/api/v3/myTrades?${query}&signature=${signature}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
    }
  });

  const rawAllOrders = await fetch(`https://api.binance.com/api/v3/allOrders?${query}&signature=${signature}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
    }
  })

  const myTrades = await rawMyTrades.json();
  const allOrders = await rawAllOrders.json();

  console.log(allOrders);

  const trades = myTrades.map((myTrade) => {
    const order = allOrders.find((order) => (order.orderId === myTrade.orderId) && order.status === 'FILLED');

    return {
      myTrade,
      order
    }
  });

  res.status(200).json(trades);
}
