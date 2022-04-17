import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useRequestManager } from '../hooks/useResponseChecker';

import { Button } from './Button';
import { Alert } from './Alert';

export const ModalWindowBodyAddCoin = ({
  onClose,
  onApply,
  msgBtnApply,
  msgBtnClose,
}) => {
  const { data, error, onCheckResponse, setError } = useRequestManager();
  const [addCoinIsLoading, setAddCoinIsLoading] = useState(false);
  const [coin, setCoin] = useState();

  const onAddToken = () => {
    setAddCoinIsLoading(true);

    fetch('/api/add-coin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coin
      })
    })
      .then((response) => response.json())
      .then((response) => {
        onCheckResponse(response);
      })
      .catch((e) => {
        // TODO: setError(e); need to handle
      }).finally(() => {
        setAddCoinIsLoading(false);
      })
  }

  useEffect(() => {
    if (data) {
      onApply();
      onClose();
    }
  }, [data]);

  const onChangeCoinName = (e) => {
    const name = e.target.value;

    setCoin(name.toUpperCase());
  }

  return (
    <>
      {
        error ? (
          <Alert 
            intent="danger"
            text={error.data.message}
            onClearError={() => setError(null)}
            title="Error"
          />
        ) : null
      }
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-bold">
        <div className='flex justify-end items-center'>
          <p className='text-right'>Coin:</p>
        </div>
        <div>
          <input
            onChange={onChangeCoinName}
            className="border-2 rounded-md p-2 text-xs font-bold w-full uppercase"
            type="text"
          />
        </div>
      </div>
      <div className="text-right">
        <Button 
          intent="default"
          onClick={onClose}
        >
          {msgBtnClose}
        </Button>
        <Button 
          onClick={onAddToken}
          intent="primary"
          className="ml-4"
          isLoading={addCoinIsLoading}
        >
          {msgBtnApply}
        </Button>
      </div>
    </>
  )
}

ModalWindowBodyAddCoin.propTypes = {
  onApply: PropTypes.func,
  onClose: PropTypes.func,
  msgBtnApply: PropTypes.string,
  msgBtnClose: PropTypes.string,
}