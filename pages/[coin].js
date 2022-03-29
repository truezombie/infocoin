import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';

import { getButtonClasses } from '../utils/styles/button';
import { Loader, ModalWindow, ModalWindowBodyCreateOrder } from '../components';

export default function Coin() {
  const [transactions, setTransaction] = useState([]);
  const [transactionsIsLoading, setTransactionsIsLoading] = useState(true);
  const [createOrderModalWindowIsOpen, setCreateOrderModalWindowIsOpen] = useState({
    isOpen: false,
    data: null,
  });
  const router = useRouter();
  const { coin } = router.query;

  useEffect(() => {
    if (coin) {
      fetch(`/api/${coin}`)
      .then(response => response.json())
      .then((data) => {
        if (data && data.length) {
          setTransaction(data);
        }
      })
      .finally(() => setTransactionsIsLoading(false))
    }
  }, [coin]);

  const getDateFromTimestamp = (timestamp) => {
    const today = new Date(timestamp);

    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    return `${date} ${time}`;
  }

  const onCloseCreateOrderModalWindow = useCallback(() => {
    setCreateOrderModalWindowIsOpen({
      isOpen: false,
      data: null,
    });
  }, []);

  const onApplyCreateOrderModalWindow = useCallback(() => {

  }, []);


  console.log(createOrderModalWindowIsOpen);

  return (
    <>
      <main className="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="items-baseline justify-between py-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Infocoin</h1>
        </div>
        {
          transactionsIsLoading ? (
            <div className="flex h-50 items-center justify-center w-full h-full grow">
              <Loader />
            </div>
          ) : (
            <table className="table-auto">
              <thead>
                <tr>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b rounded-tl-md'>Symbol</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>Data</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>{coin} amount</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>Price $</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>Price for 1 {coin}</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>Commission</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>Status</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b'>Profit</th>
                  <th className='bg-gray-100 sm:px-3 lg:px-4 sm:py-3 lg:py-4 text-left border-b rounded-tr-md'></th>
                </tr>
              </thead>
              <tbody>
                {
                  transactions.length !== 0 ? transactions.map((transaction) => {
                    return (
                      <tr key={transaction.myTrade.id}>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>{transaction.myTrade.commissionAsset}/USDT</td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>{getDateFromTimestamp(transaction.myTrade.time)}</td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>{transaction.myTrade.qty}</td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>{transaction.myTrade.quoteQty}</td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>{transaction.myTrade.price}</td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>{transaction.myTrade.commission}</td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>
                          <span className='py-1 px-2 bg-gray-600 rounded-md text-white'>No orders</span>
                        </td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>
                          -
                        </td>
                        <td className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold'>
                          <button
                            onClick={() => setCreateOrderModalWindowIsOpen({
                              isOpen: true,
                              data: transaction,
                            })}
                            className={getButtonClasses('primary')}
                          >
                            Create order
                          </button>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan='7' className='sm:px-3 lg:px-4 sm:py-3 lg:py-4 border-b text-xs font-bold text-center'>Not Found</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          )
        }
      </main>
      <ModalWindow
        isOpen={createOrderModalWindowIsOpen.isOpen}
        onApply={onApplyCreateOrderModalWindow}
        msgTitle="Create order"
      >
        <ModalWindowBodyCreateOrder
          oneCoinPrice={Number(createOrderModalWindowIsOpen.data?.myTrade.price)}
          orderPrice={Number(createOrderModalWindowIsOpen.data?.myTrade.quoteQty)}
          orderCommission={Number(createOrderModalWindowIsOpen.data?.myTrade.commission)}
          msgBtnClose="Close"
          msgBtnApply="Create order"
          onClose={onCloseCreateOrderModalWindow}
        />
      </ModalWindow>
    </>
  )
}