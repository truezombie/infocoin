import crypto from 'crypto';

function getTimestamp() {
  return new Date().getTime();
}

function getSignature(query_string) {
  return crypto.createHmac('sha256', process.env.BINANCE_API_SECRET).update(`timestamp=${query_string}`).digest('hex');
}

export default async function handler(req, res) {
  const timestamp = getTimestamp();
  const signature = getSignature(timestamp);

  fetch(`https://api.binance.com/sapi/v1/capital/config/getall?timestamp=${timestamp}&signature=${signature}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
      }
    })
    .then(response => response.json())
    .then(data => {
      const filteredCoins = data.filter(({ free }) => Number(free) !== 0);

      res.status(200).json(filteredCoins)
    });
}
