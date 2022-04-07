import { useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from './Button';
import { Alert } from './Alert';

export const ModalWindowBodyAddCoin = ({
  onClose,
  onApply,
  msgBtnApply,
  msgBtnClose,
}) => {
  const [coin, setCoin] = useState();
  const [error, setError] = useState(null);
  const [addCoinIsLoading, setAddCoinIsLoading] = useState(false);

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
      .then((data) => {
        if (data.status === 'ERROR') {
          setError(data);
        } else {
          onApply();
        }
      })
      .catch((e) => setError(e))
      .finally(() => {
          setAddCoinIsLoading(false)

          if (!error) {
            onClose();
          }
      })
  }

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
            className="border-2 rounded-md p-2 mr-2 text-xs font-bold w-full uppercase"
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