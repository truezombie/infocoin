import PropTypes from 'prop-types';

export const FullBlockMessage = ({ text }) => {
  return (
    <div className='flex h-50 items-center justify-center w-full h-full grow'>
      <p className='font-extrabold text-xl'>{text}</p>
    </div>
  )
}

FullBlockMessage.propTypes = {
  text: PropTypes.string.isRequired,
}