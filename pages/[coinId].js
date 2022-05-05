import React from 'react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, Fragment } from 'react';

import {
  FullBlockLoader,
  ModalWindow,
  ModalWindowBodyBuyCoins,
  ModalWindowBodySellCoins,
  ModalWindowBodyFirstBuyCoins,
  FullBlockMessage,
  Button,
  Header,
} from '../components';
import { useRequestManager } from '../hooks/useResponseChecker';
import { useModalWindow } from '../hooks/useModalWindow';
import { getDateFromTimestamp } from '../utils/time';
import { orderStatuses, orderPartStatuses } from '../utils/constants';
import {
  getOrderSideLabel,
  getOrderTypeLabel,
  getOrderPartStatusLabel,
  getOrderStatusLabel,
} from '../utils/labels';

export default function Coin() {
  const { data, onCheckResponse } = useRequestManager();
  const [transactionsIsLoading, setTransactionsIsLoading] = useState(false);
  const [
    sellTokensModalWindowIsOpen,
    setSellTokensModalWindowIsOpen,
    onCloseSellTokensModalWindow,
  ] = useModalWindow();
  const [
    buyTokensModalWindowIsOpen,
    setBuyTokensModalWindowIsOpen,
    onCloseBuyTokensModalWindow,
  ] = useModalWindow();
  const [buyFirstTokensModalWindowIsOpen, setFirstBuyTokensModalWindowIsOpen] =
    useState(false);
  const [closeOrderModalWindowIsOpen, setCloseOrderModalWindowIsOpen] =
    useState(false);

  const router = useRouter();
  const { coinId } = router.query;

  const onLoadOrders = useCallback(() => {
    setTransactionsIsLoading(true);

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

  const onCloseFirstBuyTokensModalWindow = useCallback(() => {
    setFirstBuyTokensModalWindowIsOpen(false);
  }, []);

  const getOrderPartActionButton = (order, orderPart) => {
    if (
      order.status === orderStatuses.buyInProgress ||
      order.status === orderStatuses.sellInProgress
    ) {
      return (
        <button
          onClick={() => setCloseOrderModalWindowIsOpen(true)}
          className='text-xs font-bold text-blue-500 hover:text-blue-600'
        >
          Close order
        </button>
      );
    }

    if (
      order.status === orderStatuses.buyDone &&
      orderPart.status === orderPartStatuses.filled
    ) {
      return (
        <button
          className='text-xs font-bold text-blue-500 hover:text-blue-600'
          onClick={() =>
            setSellTokensModalWindowIsOpen({
              isOpen: true,
              data: orderPart,
            })
          }
        >
          Sell tokens
        </button>
      );
    }

    if (
      order.status === orderStatuses.sellDone &&
      orderPart.status === orderPartStatuses.filled
    ) {
      return (
        <button
          onClick={() =>
            setBuyTokensModalWindowIsOpen({
              isOpen: true,
              data: orderPart,
            })
          }
          className='text-xs font-bold text-blue-500 hover:text-blue-600'
        >
          Buy tokens
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <main className='flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen'>
        <Header>
          <Button
            intent='primary'
            onClick={() => setFirstBuyTokensModalWindowIsOpen(true)}
          >
            Buy {data?.coin.coin}
          </Button>
        </Header>

        {transactionsIsLoading ? <FullBlockLoader /> : null}

        {!transactionsIsLoading && (!data || data?.coin.orders.length === 0) ? (
          <FullBlockMessage text='No data found' />
        ) : null}

        <div className='overflow-auto w-full'>
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
                    {data.coin.coin} amount
                  </th>
                  <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                    Price $
                  </th>
                  <th className='bg-white p-2 text-left text-sm border-b-2 border-r'>
                    Price for 1 {data.coin.coin}
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
                {data?.coin.orders.map((order, transactionIndex) => (
                  <Fragment key={order.id}>
                    {order?.orderParts.length !== 0
                      ? order?.orderParts.map((orderPart, index) => {
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
                                  rowSpan={order.orderParts.length}
                                  className='p-2 border-r border-b text-xs'
                                >
                                  {getOrderStatusLabel(order.status)}
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
                                {getOrderPartActionButton(order, orderPart)}
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
        </div>
      </main>
      <ModalWindow isOpen={closeOrderModalWindowIsOpen} msgTitle='Close order'>
        <>
          <p className='text-small text-xs font-bold mb-4'>
            You are want to close order. Are you sure?
          </p>
          <div className='text-right'>
            <Button
              intent='default'
              onClick={() => setCloseOrderModalWindowIsOpen(false)}
            >
              Close
            </Button>
            <Button intent='danger' className='ml-4'>
              Close order
            </Button>
          </div>
        </>
      </ModalWindow>
      <ModalWindow
        isOpen={sellTokensModalWindowIsOpen.isOpen}
        msgTitle={`Sell ${data?.coin.coin}`}
      >
        <ModalWindowBodySellCoins
          coin={data?.coin.coin}
          oneCoinPrice={Number(sellTokensModalWindowIsOpen.data?.oneCoinPrice)}
          orderPrice={Number(sellTokensModalWindowIsOpen.data?.fullPrice)}
          coinsAmount={Number(sellTokensModalWindowIsOpen.data?.coinsAmount)}
          msgBtnClose='Close'
          msgBtnApply='Sell tokens'
          onLoadOrders={onLoadOrders}
          onClose={onCloseSellTokensModalWindow}
        />
      </ModalWindow>
      <ModalWindow
        isOpen={buyTokensModalWindowIsOpen.isOpen}
        msgTitle={`Buy ${data?.coin.coin}`}
      >
        <ModalWindowBodyBuyCoins
          coin={data?.coin.coin}
          oneCoinPrice={Number(buyTokensModalWindowIsOpen.data?.oneCoinPrice)}
          orderPrice={Number(buyTokensModalWindowIsOpen.data?.fullPrice)}
          coinsAmount={Number(buyTokensModalWindowIsOpen.data?.coinsAmount)}
          msgBtnClose='Close'
          msgBtnApply='Buy tokens'
          onLoadOrders={onLoadOrders}
          onClose={onCloseBuyTokensModalWindow}
        />
      </ModalWindow>
      <ModalWindow
        isOpen={buyFirstTokensModalWindowIsOpen}
        msgTitle={`Buy first ${data?.coin.coin}`}
      >
        <ModalWindowBodyFirstBuyCoins
          coin={data?.coin.coin}
          msgBtnClose='Close'
          msgBtnApply='Buy coins'
          onLoadOrders={onLoadOrders}
          onClose={onCloseFirstBuyTokensModalWindow}
        />
      </ModalWindow>
    </>
  );
}
