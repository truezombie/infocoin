import { getTimestamp, getSignature, getHeaders } from '../../utils/api';

export default async function handler(req, res) {
  const timestamp = getTimestamp();
  const query = `timestamp=${timestamp}`
  const signature = getSignature(query);

  fetch(`https://api.binance.com/sapi/v1/capital/config/getall?${query}&signature=${signature}`, getHeaders())
    .then(response => response.json())
    .then(data => {
      const filteredCoins = data.filter(({ free }) => Number(free) !== 0);

      res.status(200).json(filteredCoins)
  });
}
