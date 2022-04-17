export const Input = ({ className, error, ...rest }) => {
  return (
    <input
      className={`border-2 rounded-md p-2 text-xs font-bold w-full ${error ? 'border-red-500' : ''} ${className}`}
      {...rest}
    />
  );
}