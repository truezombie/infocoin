export const STABLE_COIN = 'USDT';

export const orderSides = {
  sell: 'SELL',
  buy: 'BUY',
};

export const orderTypes = {
  limit: 'LIMIT',
  market: 'MARKET',
  stopLoss: 'STOP_LOSS',
  stopLossLimit: 'STOP_LOSS_LIMIT',
  takeProfit: 'TAKE_PROFIT',
  takeProfitLimit: 'TAKE_PROFIT_LIMIT',
  limitMaker: 'LIMIT_MAKER'
};

export const orderPartStatuses = {
  new: 'NEW',
  partiallyFilled: 'PARTIALLY_FILLED',
  filled: 'FILLED',
  canceled: 'CANCELED',
  pendingCancel: 'PENDING_CANCEL',
  rejected: 'REJECTED',
  expired: 'EXPIRED'
}

export const orderStatuses = {
  buyInProgress: 'BUY_IN_PROGRESS',
  buyDone: 'BUY_DONE',
  sellInProgress: 'SELL_IN_PROGRESS',
  sellDone: 'SELL_DONE'
}
