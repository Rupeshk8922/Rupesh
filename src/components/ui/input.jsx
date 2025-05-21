
const Input = ({ type = 'text', placeholder = '', value, onChange, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="border px-3 py-2 rounded" // Add some basic styling classes if you use Tailwind CSS or similar
      {...props}
    />
  );
};

export { Input };