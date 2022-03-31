import PropTypes from 'prop-types';

const ButtonIntends = {
  default: 'hover:border-slate-600 hover:text-slate-600 border-slate-500 text-slate-500',
  primary: 'hover:border-blue-600 hover:text-blue-600 border-blue-500 text-blue-500',
  danger: 'hover:border-red-600 hover:text-red-600 border-red-500 text-red-500',
  success: 'hover:border-lime-600 hover:text-lime-600 border-lime-500 text-lime-500',
  warning: 'hover:border-yellow-600 hover:text-yellow-600 border-yellow-500 text-yellow-500'
}

export const Button = ({ children, intent, className, ...rest }) => {
  return (
    <button className={`${className} text-xs font-bold px-2 py-2 rounded-md border-2 ${ButtonIntends[intent]}`} {...rest}>
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  className: PropTypes.string,
  intent: PropTypes.oneOf(['default', 'primary', 'danger', 'success', 'warning']).isRequired,
  rest: PropTypes.object
}