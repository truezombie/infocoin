import { getTimestamp, getSignature, getHeaders } from '../../../utils/api';
import { STABLE_COIN } from '../../../utils/constants';

export default async function handler(req, res) {
  const { coin } = req.query;
  const timestamp = getTimestamp();
  const query = `timestamp=${timestamp}`;
  const signature = getSignature(query);

  const rawCurrentCoin = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
  const rawUsdtAvailable = await fetch(`https://api.binance.com/sapi/v1/capital/config/getall?${query}&signature=${signature}`, getHeaders());

  const currentCoin = await rawCurrentCoin.json();
  const usdtAvailable = await rawUsdtAvailable.json();

  const stableCoin = usdtAvailable.find(({ coin }) => coin === STABLE_COIN);

  res.status(200).json({
    currentCoin,
    stableCoin
  });
}
