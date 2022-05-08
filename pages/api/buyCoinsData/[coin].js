import { STABLE_COIN } from '../../../utils/constants';
import { authGuardHof } from '../../../utils/guards';
import { getTimestamp, getSignature, getHeaders } from '../../../utils/api';
import {
  ApiResponseSuccess,
  ApiResponseError,
  RESPONSE_STATUSES,
} from '../../../utils/responses';

const getAveragePrices = async (symbol) => {
  const interval = '5m'
  const currentSymbol = symbol ? `symbol=${symbol}${STABLE_COIN}` : '';

  const candlesRaw = await fetch(
    `https://api.binance.com/api/v3/klines?${currentSymbol}&interval=${interval}`,
    getHeaders(),
  );
  const candles = await candlesRaw.json();

  const sumMargins = candles.reduce((acc, curr) => {
    const diff = Number(curr[4]) - Number(curr[1]);

    if (diff > 0) {
      acc.upMargin += diff;
      acc.upLength += 1;
    } else {
      acc.downMargin += diff;
      acc.downLength += 1;
    }

    return acc;
  }, {
    upMargin: 0,
    upLength: 0,
    downMargin: 0,
    downLength: 0,
  });

  return {
    up: sumMargins.upMargin / sumMargins.upLength,
    down: sumMargins.downMargin / sumMargins.downLength,
  };
}

async function handler(req, res) {
  try {
    const { coin } = req.query;

    const candles = await getAveragePrices(coin);

    console.log(candles);

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
