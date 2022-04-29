import { createBinanceOrder } from './create-buy-order';
import {
  ApiResponseError,
  ApiResponseSuccess,
  RESPONSE_STATUSES,
  ErrorData,
} from '../../utils/responses';
import { postRequestGuardHof, authGuardHof } from '../../utils/guards';

async function handler(req, res) {
  const { symbol, side, type, quantity, price } = req.body;

  try {
    const binanceCreateOrder = await createBinanceOrder(symbol, side, type, quantity, price);

    if (binanceCreateOrder?.code && binanceCreateOrder?.msg) {
      res
        .status(500)
        .json(
          new ApiResponseError(
            RESPONSE_STATUSES.ERROR,
            new ErrorData(
              binanceCreateOrder?.code,
              binanceCreateOrder?.msg,
            ),
          ),
        );
    }

    // TODO: set data to the db

    res
    .status(200)
    .json(new ApiResponseSuccess(RESPONSE_STATUSES.SUCCESS, {}));
  } catch (e) {
    res.status(500).json(new ApiResponseError());
  }
}

export default postRequestGuardHof(authGuardHof(handler));