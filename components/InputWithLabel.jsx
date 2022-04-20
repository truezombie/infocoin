import React from 'react';
import PropTypes from 'prop-types';

import { Input } from './Input';

export const InputWithLabel = ({ label, name, error, helperText, ...rest }) => {
  return (
    <>
      <label
        htmlFor={name}
        className='w-full text-sm inline-block mb-0.5 text-slate-500'
      >
        {label}
      </label>
      <Input error={error} {...rest} />
      {error ? (
        <span className='mt-0.5 text-xs color text-red-500 font-bold'>
          {helperText}
        </span>
      ) : null}
    </>
  );
};

InputWithLabel.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string
}

