import PropTypes from 'prop-types';
import { useState, useEffect} from 'react';

import { Button } from '../components'
import { Loader } from './Loader';

export const ModalWindowBodyBuyCoins = ({
  coin,
  onClose,
  onApply,
  msgBtnApply,
  msgBtnClose,
}) => {
  const [spendMoneyInPercentage, setSpendMoneyInPercentage] = useState(5);
  const [spendMoneyInDollars, setSpendMoneyInDollars ] = useState(0);
  const [limitOrderOneCoinCost, setLimitOrderOneCoinCost] = useState(0);
  const [isLimitOrder, setIsLimitOrder] = useState(false);
  const [buyCoinsData, setBuyCoinsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const onChangeMoneyInPercentage = (e) => {
    setSpendMoneyInPercentage(Number(e.target.value));
    setSpendMoneyInDollars(Number(e.target.value) * Number(buyCoinsData?.stableCoin.free) / 100);
  }

  const onChangeSpendMoneyInDollars = (e) => {
    setSpendMoneyInDollars(Number(e.target.value));
    setSpendMoneyInPercentage(100 * Number(e.target.value) / Number(buyCoinsData?.stableCoin.free));
  }

  const onChangeLimitOrderOneCoinCost = (e) => {
    setLimitOrderOneCoinCost(Number(e.target.value) );
  }

  const onChangeIsLimitOrder = () => {
    setIsLimitOrder(!isLimitOrder);
  }

  useEffect(() => {
    fetch(`/api/buyCoinsData/${coin}`)
    .then(response => response.json())
    .then((data) => {
      setSpendMoneyInDollars(spendMoneyInPercentage * data.stableCoin.free / 100);
      setLimitOrderOneCoinCost(Number(data.currentCoin.price));
      setBuyCoinsData(data);
    })
    .finally(() => setIsLoading(false))
  }, [coin]);

  return isLoading ? <Loader /> : (
    <>
      <div className="grid grid-cols-2 gap-3 sm:pb-3 lg:pb-4 text-xs font-bold">
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
          <p className='text-right'>Spend money in percentage:</p>
        </div>
        <div>
          <input
            onChange={onChangeMoneyInPercentage}
            value={spendMoneyInPercentage}
            className="border-2 rounded-md p-2 mr-2 text-xs font-bold"
            type="number"
            min={0}
            max={100}
          />
          %
        </div>

        <div className='flex justify-end items-center'>
          <p className='text-right'>Spend money:</p>
        </div>
        <div>
          <input
            onChange={onChangeSpendMoneyInDollars}
            className="border-2 rounded-md p-2 mr-2 text-xs font-bold"
            value={spendMoneyInDollars}
            type="number"
            min={0}
            max={Number(buyCoinsData?.stableCoin.free)}
          />
          $
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
                  className="border-2 rounded-md p-2 mr-2 text-xs font-bold"
                  value={limitOrderOneCoinCost}
                  type="number"
                  min={0}
                  max={Number(buyCoinsData?.currentCoin.price)}
                />
                $
              </div>
            </>
          ) : null
        }
      </div>


      <div className="text-right sm:pt-3 lg:pt-4">
        <Button 
          intent="default"
          onClick={onClose}
        >
          {msgBtnClose}
        </Button>
        <Button 
          intent="primary"
          className="ml-4"
          onClick={onApply}
        >
          {msgBtnApply}
        </Button>
      </div>
    </>
  )
}

ModalWindowBodyBuyCoins.propTypes = {
  coin: PropTypes.string,
  onClose: PropTypes.func,
  onApply: PropTypes.func,
  msgBtnApply: PropTypes.string,
  msgBtnClose: PropTypes.string,
}