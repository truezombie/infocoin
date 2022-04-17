import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button } from './Button';
import { Loader } from './Loader';
import { Alert } from './Alert';
import { orderSides, orderTypes } from '../utils/constants';
import { useRequestManager } from '../hooks/useResponseChecker';

export const ModalWindowBodyBuyCoins = ({
  coin,
  onClose,
  onLoadOrders,
  msgBtnApply,
  msgBtnClose,
}) => {
  const {
    data: buyTokensData,
    error: buyTokensError,
    setError: setBuyTokensError,
    onCheckResponse: onCheckBuyTokensResponse,
  } = useRequestManager();
  const {
    data: coinData,
    error: coinError,
    setError: setCoinError,
    onCheckResponse: onCheckCoinResponse,
  } = useRequestManager();

  const [spendMoneyInDollars, setSpendMoneyInDollars] = useState(0);
  const [wantBuyCoinsAmount, setWantBuyCoinsAmount] = useState(0);
  const [oneCoinPriceForLimitOrder, setOneCoinPriceForLimitOrder] = useState(0);
  const [isLimitOrder, setIsLimitOrder] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isOrderCreating, setIsOrderCreating] = useState(false);

  const onChangeSpendMoneyInDollars = (e) => {
    const value = Number(e.target.value);
    setSpendMoneyInDollars(value);
    setWantBuyCoinsAmount(
      value /
        (isLimitOrder ? oneCoinPriceForLimitOrder : coinData?.oneCoinPrice)
    );
  };

  const onChangeLimitOrderOneCoinCost = (e) => {
    const value = Number(e.target.value);
    setOneCoinPriceForLimitOrder(value);
    setSpendMoneyInDollars(Number(value * wantBuyCoinsAmount).toFixed(2));
  };

  const onChangeCoinsAmount = (e) => {
    const value = Number(e.target.value);
    setWantBuyCoinsAmount(value);
    setSpendMoneyInDollars(
      Number(
        isLimitOrder
          ? value * oneCoinPriceForLimitOrder
          : value * coinData?.oneCoinPrice
      ).toFixed(2)
    );
  };

  const onChangeIsLimitOrder = () => {
    const turnIsLimitOrder = !isLimitOrder;
    setIsLimitOrder(turnIsLimitOrder);
    setSpendMoneyInDollars(
      Number(
        turnIsLimitOrder
          ? wantBuyCoinsAmount * oneCoinPriceForLimitOrder
          : wantBuyCoinsAmount * coinData?.oneCoinPrice
      ).toFixed(2)
    );
  };

  useEffect(() => {
    fetch(`/api/buyCoinsData/${coin}`)
      .then((response) => response.json())
      .then((response) => {
        onCheckCoinResponse(response);
        // setOneCoinPriceForLimitOrder(Number(data.currentCoin.price));
        // setBuyCoinsData(data);
      })
      .finally(() => setIsLoading(false));
  }, [coin]);

  const onBuyTokens = useCallback(() => {
    setIsOrderCreating(true);

    fetch('/api/create-buy-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: coin,
        side: orderSides.buy,
        type: isLimitOrder ? orderTypes.limit : orderTypes.market,
        ...(isLimitOrder
          ? {
              quantity: wantBuyCoinsAmount,
              price: oneCoinPriceForLimitOrder,
            }
          : {
              quantity: wantBuyCoinsAmount,
            }),
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        onCheckBuyTokensResponse(response);
      })
      .catch((e) => {
        // TODO: need to add handler setError(data)
      }).finally(() => {
        setIsOrderCreating(false);
      })
  }, [
    coin,
    isLimitOrder,
    oneCoinPriceForLimitOrder,
    wantBuyCoinsAmount,
    onCheckBuyTokensResponse,
  ]);

  useEffect(() => {
    if (buyTokensData) {
      onClose();
      onLoadOrders();
    }
  }, [buyTokensData]);

  return (
    <>
      {buyTokensError || coinError ? (
        <Alert
          intent='danger'
          text={buyTokensError.data.message || coinError.data.message}
          onClearError={() => {
            setCoinError(null);
            setBuyTokensError(null);
          }}
          title='Error'
        />
      ) : null}

      {isLoading ? (
        <Loader />
      ) : (
        <div className='grid grid-cols-2 gap-4 text-xs font-bold'>
          <div className='flex justify-end items-center'>
            <p className='text-right'>One {coin} price:</p>
          </div>
          <div>{coinData?.oneCoinPrice || ' '}&nbsp;$</div>

          <div>
            <p className='text-right'>Available USDT:</p>
          </div>
          <div>{coinData?.moneyAvailable || ' '}&nbsp;$</div>

          <div className='flex justify-end items-center'>
            <p className='text-right'>Spend money:</p>
          </div>
          <div>
            <input
              onChange={onChangeSpendMoneyInDollars}
              className='border-2 w-28 rounded-md p-2 text-xs font-bold'
              value={spendMoneyInDollars}
              type='number'
            />
            &nbsp;$
          </div>

          <div className='flex justify-end items-center'>
            <p className='text-right'>{coin} amount: </p>
          </div>
          <div>
            <input
              onChange={onChangeCoinsAmount}
              className='border-2 w-28 rounded-md p-2 text-xs font-bold'
              value={wantBuyCoinsAmount}
              type='number'
            />
          </div>

          <div className='flex justify-end items-center'>
            <p className='text-right'>Limit order:</p>
          </div>
          <div className='flex items-center'>
            <input
              checked={isLimitOrder}
              onChange={onChangeIsLimitOrder}
              className='border-2'
              type='checkbox'
            />
          </div>
          {isLimitOrder ? (
            <>
              <div className='flex justify-end items-center'>
                <p className='text-right'>One coin should cost:</p>
              </div>
              <div>
                <input
                  onChange={onChangeLimitOrderOneCoinCost}
                  className='border-2 w-28 rounded-md p-2 text-xs font-bold'
                  value={oneCoinPriceForLimitOrder}
                  type='number'
                  min={0}
                  max={coinData?.oneCoinPrice}
                />
                &nbsp;$
              </div>
            </>
          ) : null}
        </div>
      )}

      <div className='text-right pt-4'>
        <Button intent='default' onClick={onClose}>
          {msgBtnClose}
        </Button>
        {!isLoading ? (
          <Button
            intent='primary'
            className='ml-4'
            isLoading={isOrderCreating}
            onClick={onBuyTokens}
          >
            {msgBtnApply}
          </Button>
        ) : null}
      </div>
    </>
  );
};

ModalWindowBodyBuyCoins.propTypes = {
  coin: PropTypes.string,
  onClose: PropTypes.func,
  onLoadOrders: PropTypes.func,
  msgBtnApply: PropTypes.string,
  msgBtnClose: PropTypes.string,
};
