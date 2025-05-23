import React, { ReactNode, FC } from 'react';

interface PopoverProps {
  children: ReactNode;
  className?: string;
}

export const Popover: FC<PopoverProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const PopoverTrigger: FC<PopoverProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const PopoverContent: FC<PopoverProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};
