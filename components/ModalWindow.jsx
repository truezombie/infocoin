import React from 'react';
import PropTypes from 'prop-types';

export const ModalWindow = ({ isOpen, children, msgTitle }) => {
  return isOpen ? (
    <div className='p-4 left-0 top-0 h-full w-screen bg-slate-900/20 fixed overflow-y-auto'>
      <div className='max-w-md mx-auto bg-white rounded-lg p-4 items-center '>
        <div>
          <p className='text-center font-extrabold text-2xl pb-4'>{msgTitle}</p>
        </div>
        <div className='w-full'>{children}</div>
      </div>
    </div>
  ) : null;
};

ModalWindow.propTypes = {
  isOpen: PropTypes.bool,
  children: PropTypes.element.isRequired,
  msgTitle: PropTypes.string.isRequired,
};
