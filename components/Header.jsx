import React from 'react';

import PropTypes from 'prop-types';

export const Header = ({ children }) => {
  return (
    <div className='flex flex-row items-end justify-between py-4'>
      <div>
        <h1 className='text-5xl font-extrabold tracking-tight'>Infocoin---</h1>
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
};

Header.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
