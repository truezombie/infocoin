import { useMemo, useState } from "react";
import PropTypes from 'prop-types';

import { Button } from './Button';

export const ModalWindowBodyCreateOrder = ({
  oneCoinPrice,
  orderPrice,
  orderCommission,
  onClose,
  onApply,
  msgBtnApply,
  msgBtnClose,
}) => {
  const [earnPercentage, setEarnPercentage] = useState(10);

  const willEarnMoney = useMemo(() => {
    const money = (earnPercentage * (orderPrice + orderCommission)) / 100;
    const moneyWithCommission = (money * 0.01) + money;

    return moneyWithCommission;
  },[earnPercentage, orderPrice, orderCommission]);

  const willEarnMoneyTotal = useMemo(() => {
    return willEarnMoney + orderPrice
  }, [willEarnMoney, orderPrice]);

  const oneCoinWillCost = useMemo(() => {
    return ((earnPercentage * oneCoinPrice) / 100) + oneCoinPrice;
  }, [earnPercentage, oneCoinPrice]);

  const onChangeEarnPercentage = (event) => {
    setEarnPercentage(Number(event.target.value))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:pb-3 lg:pb-4 text-xs font-bold">
        <div className="flex justify-end items-center">
          <p className="text-right">Will earn in percentage:</p>
        </div>
        <div>
          <input
            className="border-2 rounded-md p-2 mr-2 text-xs font-bold"
            type="number"
            min={0}
            max={1000}
            value={earnPercentage}
            onChange={onChangeEarnPercentage}
          />
          %
        </div>

        <div>
          <p className="text-right">Will earn in dollars:</p>
        </div>
        <div>
          <p>{willEarnMoney}$</p>
        </div>
      </div>

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b rounded-tl-md">Name</th>
            <th className="bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b">Current</th>
            <th className="bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b rounded-tr-md">Feature</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold">Full order price</td>
            <td className="sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold">{orderPrice} $</td>
            <td className="sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold">{willEarnMoneyTotal} $</td>
          </tr>
          <tr>
            <td className="sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold">One coin price</td>
            <td className="sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold">{oneCoinPrice} $</td>
            <td className="sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold">{oneCoinWillCost} $</td>
          </tr>
        </tbody>
      </table>
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
  );
}

ModalWindowBodyCreateOrder.propTypes = {
  onClose: PropTypes.func,
  onApply: PropTypes.func,
  orderPrice: PropTypes.number.isRequired,
  oneCoinPrice: PropTypes.number.isRequired,
  orderCommission: PropTypes.number.isRequired,
  msgBtnApply: PropTypes.string,
  msgBtnClose: PropTypes.string,
}