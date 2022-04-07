import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const { coinId } = req.query;

  const coin = await prisma.coin.findUnique({
    where: { 
      id: coinId,
    },
    include: {
      orders: true,
    }
  });

  res.status(200).json(coin);
}
