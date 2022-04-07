import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const coins = await prisma.coin.findMany();

  res.status(200).json(coins)
}
