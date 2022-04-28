-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LIMIT', 'MARKET', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT', 'LIMIT_MAKER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('BUY_IN_PROGRESS', 'BUY_DONE', 'SELL_IN_PROGRESS', 'SELL_DONE');

-- CreateEnum
CREATE TYPE "OrderPartStatus" AS ENUM ('NEW', 'PARTIALLY_FILLED', 'FILLED', 'CANCELED', 'PENDING_CANCEL', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "fullCoinName" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT E'BUY_IN_PROGRESS',
    "coinId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPart" (
    "id" TEXT NOT NULL,
    "clientOrderId" TEXT NOT NULL,
    "transactTime" TEXT NOT NULL,
    "fullPrice" DOUBLE PRECISION NOT NULL,
    "coinsAmount" DOUBLE PRECISION NOT NULL,
    "oneCoinPrice" DOUBLE PRECISION NOT NULL,
    "status" "OrderPartStatus" NOT NULL DEFAULT E'NEW',
    "type" "OrderType" NOT NULL DEFAULT E'MARKET',
    "side" "OrderSide" NOT NULL DEFAULT E'SELL',
    "orderId" TEXT,

    CONSTRAINT "OrderPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nickName_key" ON "User"("nickName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_coin_key" ON "Coin"("coin");

-- CreateIndex
CREATE UNIQUE INDEX "Order_coinId_key" ON "Order"("coinId");

-- AddForeignKey
ALTER TABLE "Coin" ADD CONSTRAINT "Coin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPart" ADD CONSTRAINT "OrderPart_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
