import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: string; // You might want to define a more specific union type for colors
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', ...props }) => {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded bg-${color}-200 text-${color}-800`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };