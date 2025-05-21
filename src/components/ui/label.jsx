

const Label = ({ htmlFor, children, ...props }) => {
  return (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  );
};

export { Label };