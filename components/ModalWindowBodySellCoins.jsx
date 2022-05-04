import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button } from './Button';
import { Alert } from './Alert';
import { Loader } from './Loader';
import { orderSides, orderTypes } from '../utils/constants';
import { useRequestManager } from '../hooks/useResponseChecker';

export const ModalWindowBodySellCoins = ({
  coin,
  oneCoinPrice,
  orderPrice,
  coinsAmount,
  onClose,
  onLoadOrders,
  msgBtnApply,
  msgBtnClose,
}) => {
  const {
    data: sellTokensData,
    error: sellTokensError,
    setError: setSellTokensError,
    onCheckResponse: onCheckSellTokensResponse,
  } = useRequestManager();
  const [earnPercentage, setEarnPercentage] = useState(0);
  const [isOrderCreating, setIsOrderCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const willEarnMoney = useMemo(() => {
    const money = (earnPercentage * orderPrice) / 100;
    const moneyWithCommission = money * 0.01 + money;

    return moneyWithCommission;
  }, [earnPercentage, orderPrice]);

  const willTotalPrice = useMemo(() => {
    return willEarnMoney + orderPrice;
  }, [willEarnMoney, orderPrice]);

  const oneCoinWillCost = useMemo(() => {
    return (earnPercentage * oneCoinPrice) / 100 + oneCoinPrice;
  }, [earnPercentage, oneCoinPrice]);

  const onChangeEarnPercentage = (event) => {
    setEarnPercentage(Number(event.target.value));
  };

  const onSellTokens = useCallback(() => {
    setIsOrderCreating(true);

    fetch('/api/create-sell-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: coin,
        side: orderSides.sell,
        type: orderTypes.limit,
        quantity: coinsAmount,
        price: oneCoinWillCost,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        onCheckSellTokensResponse(response);
      })
      .catch((e) => {
        // TODO: need to add handler setError(data)
      })
      .finally(() => {
        setIsOrderCreating(false);
      });
  }, [coin, coinsAmount, oneCoinPrice]);

  useEffect(() => {
    setIsLoading(true);

    fetch(`/api/sellCoinsData/${coin}`)
      .then((response) => response.json())
      .then((response) => {
        setEarnPercentage(((response.data.priceMargins.up * 100) / oneCoinPrice).toFixed(2))
      })
      .catch((e) => {
        // TODO: need to add handler setError(data)
      })
      .finally(() => setIsLoading(false));
  }, [coin]);

  useEffect(() => {
    if (sellTokensData) {
      onClose();
      onLoadOrders();
    }
  }, [sellTokensData]);

  return (
    <>
      {sellTokensError ? (
        <Alert
          intent='danger'
          text={sellTokensError.data.message}
          onClearError={() => {
            setSellTokensError(null);
          }}
          title='Error'
        />
      ) : null}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className='grid grid-cols-2 gap-3 sm:pb-3 lg:pb-4 text-xs font-bold'>
            <div className='flex justify-end items-center'>
              <p className='text-right'>Will earn in percentage:</p>
            </div>
            <div>
              <input
                className='border-2 rounded-md p-2 mr-2 text-xs font-bold'
                type='number'
                min={0}
                max={1000}
                value={earnPercentage}
                onChange={onChangeEarnPercentage}
              />
              %
            </div>

            <div>
              <p className='text-right'>Will earn in dollars:</p>
            </div>
            <div>
              <p>{willEarnMoney} $</p>
            </div>

            <div className='text-right'>Coins amount:</div>
            <div>
              <p>{coinsAmount}</p>
            </div>
          </div>

          <table className='table-auto w-full mb-4'>
            <thead>
              <tr>
                <th className='bg-white p-2 text-left text-sm border-t border-b-2 border-r rounded-tl-md'>
                  Name
                </th>
                <th className='bg-white p-2 text-left text-sm border-t border-b-2 border-r'>
                  Present
                </th>
                <th className='bg-white p-2 text-left text-sm border-t border-b-2 rounded-tr-md'>
                  Feature
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='p-2 border-r border-b text-xs'>
                  Full order price
                </td>
                <td className='p-2 border-b border-r text-xs'>
                  {orderPrice}&nbsp;$
                </td>
                <td className='p-2 border-l border-b text-xs'>
                  {willTotalPrice}&nbsp;$
                </td>
              </tr>
              <tr className='bg-gray-50'>
                <td className='p-2 border-r border-b text-xs'>
                  One coin price
                </td>
                <td className='p-2 border-b border-r text-xs'>
                  {oneCoinPrice}&nbsp;$
                </td>
                <td className='p-2 border-l border-b text-xs'>
                  {oneCoinWillCost}&nbsp;$
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <div className='text-right'>
        <Button intent='default' onClick={onClose}>
          {msgBtnClose}
        </Button>
        {!isLoading ? (
          <Button
            intent='primary'
            className='ml-4'
            isLoading={isOrderCreating}
            onClick={onSellTokens}
          >
            {msgBtnApply}
          </Button>
        ) : null}
      </div>
    </>
  );
};

ModalWindowBodySellCoins.propTypes = {
  onClose: PropTypes.func,
  onLoadOrders: PropTypes.func,
  coinsAmount: PropTypes.number.isRequired,
  orderPrice: PropTypes.number.isRequired,
  oneCoinPrice: PropTypes.number.isRequired,
  coin: PropTypes.string,
  msgBtnApply: PropTypes.string,
  msgBtnClose: PropTypes.string,
};
