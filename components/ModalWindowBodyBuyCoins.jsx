import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button } from './Button';
import { Loader } from './Loader';
import { Alert } from './Alert';
import { orderSides, orderTypes } from '../utils/constants';

export const ModalWindowBodyBuyCoins = ({
  coin,
  onClose,
  msgBtnApply,
  msgBtnClose,
}) => {
  const [spendMoneyInDollars, setSpendMoneyInDollars] = useState(0);
  const [wantBuyCoinsAmount, setWantBuyCoinsAmount] = useState(0);
  const [oneCoinPriceForLimitOrder, setOneCoinPriceForLimitOrder] = useState(0);
  const [isLimitOrder, setIsLimitOrder] = useState(false);

  const [buyCoinsData, setBuyCoinsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderCreating, setIsOrderCreating] = useState(false);
  const [error, setError] = useState(null);

  const onChangeSpendMoneyInDollars = (e) => {
    const value = Number(e.target.value);
    setSpendMoneyInDollars(value);
    setWantBuyCoinsAmount(value / (isLimitOrder ? oneCoinPriceForLimitOrder : Number(buyCoinsData?.currentCoin.price)));
  }

  const onChangeLimitOrderOneCoinCost = (e) => {
    const value = Number(e.target.value); 
    setOneCoinPriceForLimitOrder(value);
    setSpendMoneyInDollars(value * wantBuyCoinsAmount);
  }

  const onChangeCoinsAmount = (e) => {
    const value = Number(e.target.value);
    setWantBuyCoinsAmount(value);
    setSpendMoneyInDollars(isLimitOrder ? value * oneCoinPriceForLimitOrder : value * Number(buyCoinsData?.currentCoin.price))
  }

  const onChangeIsLimitOrder = () => {
    const turnIsLimitOrder = !isLimitOrder;
    setIsLimitOrder(turnIsLimitOrder);
    setSpendMoneyInDollars(turnIsLimitOrder ? wantBuyCoinsAmount * oneCoinPriceForLimitOrder : wantBuyCoinsAmount * Number(buyCoinsData?.currentCoin.price));
  }

  useEffect(() => {
    fetch(`/api/buyCoinsData/${coin}`)
    .then(response => response.json())
    .then((data) => {
      setOneCoinPriceForLimitOrder(Number(data.currentCoin.price));
      setBuyCoinsData(data);
    })
    .finally(() => setIsLoading(false))
  }, [coin]);

  const onBuyTokens = useCallback(() => {
    setIsOrderCreating(true);

    fetch('/api/create-buy-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbol: coin,
        side: orderSides.buy,
        type: isLimitOrder ? orderTypes.limit : orderTypes.market,
        ...(isLimitOrder ? { 
          quantity: wantBuyCoinsAmount,
          price: oneCoinPriceForLimitOrder,
        } : {
          quantity: wantBuyCoinsAmount,
        })
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ERROR') {
          setError(data);
        }
      })
      .catch((e) => setError(data))
      .finally(() => setIsOrderCreating(false))
  }, [coin, isLimitOrder, oneCoinPriceForLimitOrder, wantBuyCoinsAmount]);

  return (
    <>
      {error ? (
        <Alert 
          intent="danger"
          text={error.data.message}
          onClearError={() => setError(null)}
          title="Error"
        />) : null
      }

      {isLoading ? <Loader /> : (
        <div className="grid grid-cols-2 gap-4 text-xs font-bold">
          <div className="flex justify-end items-center">
            <p className="text-right">One {coin} price:</p>
          </div>
          <div>
            <p>{buyCoinsData?.currentCoin.price ? Number(buyCoinsData?.currentCoin.price) : '-'} $</p>
          </div>

          <div>
            <p className="text-right">Available USDT:</p>
          </div>
          <div>
            <p>{buyCoinsData?.stableCoin.free ? Number(buyCoinsData?.stableCoin.free) : '-'} $</p>
          </div>

          <div className='flex justify-end items-center'>
            <p className='text-right'>Spend money:</p>
          </div>
          <div>
            <input
              onChange={onChangeSpendMoneyInDollars}
              className="border-2 w-28 rounded-md p-2 text-xs font-bold"
              value={spendMoneyInDollars}
              type="number"
            />
            &nbsp;$
          </div>

          <div className='flex justify-end items-center'>
            <p className='text-right'>{coin} amount: </p>
          </div>
          <div>
            <input
              onChange={onChangeCoinsAmount}
              className="border-2 w-28 rounded-md p-2 text-xs font-bold"
              value={wantBuyCoinsAmount}
              type="number"
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
              type="checkbox"
            />
          </div>
        {
          isLimitOrder ? (
            <>
              <div className='flex justify-end items-center'>
                <p className='text-right'>One coin should cost:</p>
              </div>
              <div>
                <input
                  onChange={onChangeLimitOrderOneCoinCost}
                  className="border-2 w-28 rounded-md p-2 text-xs font-bold"
                  value={oneCoinPriceForLimitOrder}
                  type="number"
                  min={0}
                  max={Number(buyCoinsData?.currentCoin.price)}
                />
                &nbsp;$
              </div>
            </>
          ) : null
        }
        </div>)}

      <div className="text-right pt-4">
        <Button 
          intent="default"
          onClick={onClose}
        >
          {msgBtnClose}
        </Button>
        {
          !isLoading ? (
            <Button 
              intent="primary"
              className="ml-4"
              isLoading={isOrderCreating}
              onClick={onBuyTokens}
            >
              {msgBtnApply}
            </Button>
          ) : null 
        }
      </div>
    </>
  )
}

ModalWindowBodyBuyCoins.propTypes = {
  coin: PropTypes.string,
  onClose: PropTypes.func,
  msgBtnApply: PropTypes.string,
  msgBtnClose: PropTypes.string,
}