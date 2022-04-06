import PropTypes from 'prop-types';

const ButtonIntends = {
  default: 'hover:border-slate-600 hover:text-slate-600 border-slate-500 text-slate-500 disabled:border-slate-300 disabled:text-slate-300',
  primary: 'hover:border-blue-600 hover:text-blue-600 border-blue-500 text-blue-500 disabled:border-blue-300 disabled:text-blue-300',
  danger: 'hover:border-red-600 hover:text-red-600 border-red-500 text-red-500 disabled:border-red-300 disabled:text-red-300',
  success: 'hover:border-lime-600 hover:text-lime-600 border-lime-500 text-lime-500 disabled:border-lime-300 disabled:text-lime-300',
  warning: 'hover:border-yellow-600 hover:text-yellow-600 border-yellow-500 text-yellow-500 disabled:border-yellow-300 disabled:text-yellow-300'
}

export const Button = ({ children, intent, className, isLoading, isDisabled, ...rest }) => {
  return (
    <button
      disabled={isLoading || isDisabled}
      className={`${className} text-xs font-bold px-2 py-2 rounded-md border-2 ${ButtonIntends[intent]}`}
      {...rest}
    >
      { isLoading ? 'Loading...' : children }
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  intent: PropTypes.oneOf(['default', 'primary', 'danger', 'success', 'warning']).isRequired,
  rest: PropTypes.object
}