import { STABLE_COIN } from '../../../utils/constants';
import { authGuardHof } from '../../../utils/guards';
import { getTimestamp, getSignature, getHeaders } from '../../../utils/api';
import {
  ApiResponseSuccess,
  ApiResponseError,
  RESPONSE_STATUSES,
} from '../../../utils/responses';

async function handler(req, res) {
  try {
    const { coin } = req.query;

    const timestamp = getTimestamp();
    const query = `timestamp=${timestamp}`;
    const signature = getSignature(query);

    const rawCurrentCoin = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`,
    );
    const rawUsdtAvailable = await fetch(
      `https://api.binance.com/sapi/v1/capital/config/getall?${query}&signature=${signature}`,
      getHeaders(),
    );

    const currentCoin = await rawCurrentCoin.json();
    const usdtAvailable = await rawUsdtAvailable.json();

    const stableCoin = usdtAvailable.find(({ coin }) => coin === STABLE_COIN);

    res.status(200).json(
      new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, {
        oneCoinPrice: Number(currentCoin.price),
        moneyAvailable: Number(stableCoin.free),
      }),
    );
  } catch (e) {
    res.status(500).json(new ApiResponseError());
  }
}

export default authGuardHof(handler);
