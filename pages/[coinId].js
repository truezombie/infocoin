import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, Fragment } from 'react';

import {
  FullBlockLoader,
  ModalWindow,
  // ModalWindowBodyCreateOrder,
  ModalWindowBodyBuyCoins,
  FullBlockMessage,
  Button,
  Header,
} from '../components';
import { useRequestManager } from '../hooks/useResponseChecker';
import { getDateFromTimestamp } from '../utils/time';
import { getOrderSideLabel, getOrderTypeLabel, getOrderPartStatusLabel, getOrderStatusLabel } from '../utils/labels';

export default function Coin() {
  const { data, onCheckResponse } = useRequestManager();
  // const [coinData, setCoinData] = useState(null);
  const [transactionsIsLoading, setTransactionsIsLoading] = useState(true);
  // const [createOrderModalWindowIsOpen, setCreateOrderModalWindowIsOpen] =
  //   useState({
  //     isOpen: false,
  //     data: null,
  //   });
  const [buyTokensModalWindowIsOpen, setBuyTokensModalWindowIsOpen] =
    useState(false);
  const router = useRouter();
  const { coinId } = router.query;

  const onLoadOrders = useCallback(() => {
    if (coinId) {
      fetch(`/api/${coinId}`)
        .then((response) => response.json())
        .then((response) => {
          onCheckResponse(response);
        })
        .finally(() => setTransactionsIsLoading(false));
    }
  }, [coinId, onCheckResponse]);

  useEffect(() => {
    onLoadOrders();
  }, [onLoadOrders]);

  // const onCloseCreateOrderModalWindow = useCallback(() => {
  //   setCreateOrderModalWindowIsOpen({
  //     isOpen: false,
  //     data: null,
  //   });
  // }, []);

  // const onApplyCreateOrderModalWindow = useCallback(() => {}, []);

  const onCloseBuyTokensModalWindow = useCallback(() => {
    setBuyTokensModalWindowIsOpen(false);
  }, []);

  console.log(data);

  return (
    <>
      <main className='flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen'>

        <Header>
          <Button
            intent='primary'
            onClick={() => setBuyTokensModalWindowIsOpen(true)}
          >
            Buy {data?.coin.coin}
          </Button>
        </Header>

        {transactionsIsLoading ? <FullBlockLoader /> : null}

        {!transactionsIsLoading && (!data || data?.coin.orders.length === 0) ? (
          <FullBlockMessage text='No data found' />
        ) : null}

        {!transactionsIsLoading && data && data?.coin.orders.length !== 0 ? (
          <table className='table-auto'>
            <thead>
              <tr>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r rounded-tl-md'>
                  Order status
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  Data
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  {data?.coin} amount
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  Price $
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  Price for 1 {data?.coin}
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  Order part status
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  Order type
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                  Order side
                </th>
                <th className='bg-white p-2 text-left text-sm border-b-2 rounded-tr-md'></th>
              </tr>
            </thead>

            <tbody>
              {data?.orders.map((transaction, transactionIndex) => (
                <Fragment key={transaction.id}>
                  {transaction?.orderParts.length !== 0
                    ? transaction?.orderParts.map((orderPart, index) => {
                        return (
                          <tr
                            key={orderPart.id}
                            className={
                              transactionIndex % 2 === 0
                                ? 'bg-white'
                                : 'bg-gray-50'
                            }
                          >
                            {index === 0 ? (
                              <td
                                rowSpan={transaction.orderParts.length}
                                className='p-2 border-r border-b text-xs'
                              >
                                {getOrderStatusLabel(transaction.status)}
                              </td>
                            ) : null}
                            <td className='p-2 border-b border-r text-xs'>
                              {getDateFromTimestamp(orderPart.transactTime)}
                            </td>
                            <td className='p-2 border-b border-r text-xs'>
                              {orderPart.coinsAmount}
                            </td>
                            <td className='p-2 border-b border-r text-xs'>
                              {orderPart.fullPrice}
                            </td>
                            <td className='p-2 border-b border-r text-xs'>
                              {orderPart.oneCoinPrice}
                            </td>
                            <td className='p-2 border-b border-r text-xs'>
                              {getOrderPartStatusLabel(orderPart.status)}
                            </td>
                            <td className='p-2 border-b border-r text-xs'>
                              {getOrderTypeLabel(orderPart.type)}
                            </td>
                            <td className='p-2 border-b border-r text-xs'>
                              {getOrderSideLabel(orderPart.side)}
                            </td>
                            <td className='p-2 border-l border-b text-xs'>
                              <button className='text-xs font-bold text-blue-500 hover:text-blue-600'>Sell tokens</button>
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>
      {/* <ModalWindow
        isOpen={createOrderModalWindowIsOpen.isOpen}
        msgTitle='Create order'
      >
        <ModalWindowBodyCreateOrder
          oneCoinPrice={Number(
            createOrderModalWindowIsOpen.data?.myTrade.price
          )}
          orderPrice={Number(
            createOrderModalWindowIsOpen.data?.myTrade.quoteQty
          )}
          orderCommission={Number(
            createOrderModalWindowIsOpen.data?.myTrade.commission
          )}
          msgBtnClose='Close'
          msgBtnApply='Create order'
          onClose={onCloseCreateOrderModalWindow}
          onApply={onApplyCreateOrderModalWindow}
        />
      </ModalWindow> */}
      <ModalWindow isOpen={buyTokensModalWindowIsOpen} msgTitle={`Buy ${data?.coin.coin}`}>
        <ModalWindowBodyBuyCoins
          coin={data?.coin.coin}
          msgBtnClose='Close'
          msgBtnApply='Buy coins'
          onLoadOrders={onLoadOrders}
          onClose={onCloseBuyTokensModalWindow}
        />
      </ModalWindow>
    </>
  );
}
