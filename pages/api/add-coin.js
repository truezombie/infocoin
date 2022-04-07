import prisma from '../../lib/prisma';
import { getTimestamp, getSignature, getHeaders } from '../../utils/api';
import { ApiError } from '../../utils/error';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send(new ApiError(405, 'Only POST requests allowed'));
    return;
  }

  const { coin } = req.body;

  try {
    const timestamp = getTimestamp();
    const query = `timestamp=${timestamp}`;
    const signature = getSignature(query);

    const allCoinsRaw = await fetch(
      `https://api.binance.com/sapi/v1/capital/config/getall?${query}&signature=${signature}`,
      getHeaders()
    );
    const allCoins = await allCoinsRaw.json();

    const foundCoin = allCoins.find((item) => {
      return (item.coin === coin);
    });

    if (foundCoin) {
      const createdToken = await prisma.coin.create({
        data: {
          coin: foundCoin.coin,
          amount: Number(foundCoin.free) + Number(foundCoin.locked),
          fullCoinName: foundCoin.name,
        },
      });

      res.status(200).json({
        status: 'OK',
        data: createdToken,
      });
    } else {
      res.status(500).json(new ApiError(500, "Isn't valid coin name!"));
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(new ApiError());
  }
}
