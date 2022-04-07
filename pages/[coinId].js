import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, Fragment } from 'react';

import {
  FullBlockLoader,
  ModalWindow,
  // ModalWindowBodyCreateOrder,
  ModalWindowBodyBuyCoins,
  FullBlockMessage,
  Button,
} from '../components';
import { getDateFromTimestamp } from '../utils/time';

export default function Coin() {
  const [coinData, setCoinData] = useState(null);
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

  useEffect(() => {
    if (coinId) {
      fetch(`/api/${coinId}`)
        .then((response) => response.json())
        .then((data) => {
          setCoinData(data);
        })
        .finally(() => setTransactionsIsLoading(false));
    }
  }, [coinId]);

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

  return (
    <>
      <main className='flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen'>
        <div className='flex flex-row items-center justify-between py-6'>
          <div>
            <h1 className='text-5xl font-extrabold tracking-tight text-gray-900'>
              Infocoin
            </h1>
          </div>
          <div className='sm:pr-3 lg:pr-4'>
            <Button
              intent='primary'
              onClick={() => setBuyTokensModalWindowIsOpen(true)}
            >
              Buy {coinData?.coin}
            </Button>
          </div>
        </div>

        {transactionsIsLoading ? <FullBlockLoader /> : null}

        {!transactionsIsLoading && (!coinData || coinData?.orders.length === 0) ? (
          <FullBlockMessage text='No data found' />
        ) : null}

        {!transactionsIsLoading && coinData && coinData?.orders.length !== 0 ? (
          <table className='table-auto'>
            <thead>
              <tr>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r rounded-tl-md'>
                  Status
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  Data
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  {coinData?.coin} amount
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  Price $
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  Price for 1 {coinData?.coin}
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  Status
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  Order type
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b border-r'>
                  Order side
                </th>
                <th className='bg-emerald-50 px-2 py-1 text-left text-sm border-b rounded-tr-md'></th>
              </tr>
            </thead>

            <tbody>
              {coinData?.orders.map((transaction, transactionIndex) => (
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
                                className='px-2 py-1 border-r border-b text-xs'
                              >
                                {transaction.status}
                              </td>
                            ) : null}
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {getDateFromTimestamp(orderPart.transactTime)}
                            </td>
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {orderPart.coinsAmount}
                            </td>
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {orderPart.fullPrice}
                            </td>
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {orderPart.oneCoinPrice}
                            </td>
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {orderPart.status}
                            </td>
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {orderPart.type}
                            </td>
                            <td className='px-2 py-1 border-b border-r text-xs'>
                              {orderPart.side}
                            </td>
                            <td className='px-2 py-1 border-l border-b text-xs'>
                              button
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
      <ModalWindow isOpen={buyTokensModalWindowIsOpen} msgTitle={`Buy ${coinData?.coin}`}>
        <ModalWindowBodyBuyCoins
          coin={coinData?.coin}
          msgBtnClose='Close'
          msgBtnApply='Buy coins'
          onClose={onCloseBuyTokensModalWindow}
        />
      </ModalWindow>
    </>
  );
}
