import React from 'react';

export const Loader = () => {
  return (
    <div className="flex justify-center items-center space-x-1 text-sm">
      <span className='font-extrabold text-xl'>Loading </span>
      <span className='font-extrabold text-xl animate-bounce'>...</span>
    </div>
  )
}