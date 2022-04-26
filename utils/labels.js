import {
  orderSides,
  orderTypes,
  orderPartStatuses,
  orderStatuses,
} from './constants';

export const getOrderSideLabel = (key) => {
  switch (key) {
    case orderSides.sell:
      return '⬆️ Sell';
    case orderSides.buy:
      return '⬇️ Buy';
    default:
      return 'Side label not found';
  }
};

export const getOrderTypeLabel = (key) => {
  switch (key) {
    case orderTypes.limit:
      return 'Limit';
    case orderTypes.market:
      return 'Market';
    case orderTypes.stopLoss:
      return 'Stop loss';
    case orderTypes.stopLossLimit:
      return 'Stop loss limit';
    case orderTypes.takeProfit:
      return 'Take profit';
    case orderTypes.takeProfitLimit:
      return 'Take profit limit';
    case orderTypes.limitMaker:
      return 'Limit maker';
    default:
      return 'Order type label not found';
  }
};

export const getOrderPartStatusLabel = (key) => {
  switch (key) {
    case orderPartStatuses.new:
      return '🆕 New';
    case orderPartStatuses.partiallyFilled:
      return 'Partially filled';
    case orderPartStatuses.filled:
      return '✅ Filled';
    case orderPartStatuses.canceled:
      return 'Canceled';
    case orderPartStatuses.pendingCancel:
      return 'Pending cancel';
    case orderPartStatuses.rejected:
      return 'Rejected';
    case orderPartStatuses.expired:
      return 'Expired';
    default:
      return 'Order part label not found';
  }
};

export const getOrderStatusLabel = (key) => {
  switch (key) {
    case orderStatuses.buyInProgress:
      return 'Buy in progress';
    case orderStatuses.buyDone:
      return 'Buy done';
    case orderStatuses.sellInProgress:
      return 'Sell in progress';
    case orderStatuses.sellDone:
      return 'Sell done';
    default:
      return 'Order status label not found';
  }
};
