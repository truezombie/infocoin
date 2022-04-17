import PropTypes from 'prop-types';

const AlertIntends = {
  default: 'bg-gray-400',
  primary: 'bg-blue-400',
  danger: 'bg-red-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400'
}

export const Alert = ({ intent, text, title, onClearError }) => {
  const onClose = () => {
    onClearError();
  }

  return text ? (
    <div className={`mb-4 rounded-md text-sm text-white px-4 py-4 ${AlertIntends[intent]}`}>
      <div className='grid grid-cols-2'>
        <div>
          <p className='font-extrabold text-xl'>{title}</p>
        </div>
        <div className='text-right'>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      <p className='text-bold'>{text}</p>
    </div>
  ) : null
}

Alert.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  onClearError: PropTypes.func.isRequired,
  intent: PropTypes.oneOf(['default', 'primary', 'danger', 'success', 'warning']).isRequired,
}
