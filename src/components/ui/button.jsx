const Button = ({ children, ...props }) => {
  return (
    <button {...props}>
      {children}
    </button>
  );
};

export { Button };