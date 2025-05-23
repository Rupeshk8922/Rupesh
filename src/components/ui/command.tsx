import React, { ReactNode, InputHTMLAttributes, HTMLAttributes } from 'react';

interface CommandProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CommandInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Command: React.FC<CommandProps> = ({ children, ...props }) => {
  return <div {...props}>Command: {children}</div>;
};

export const CommandInput: React.FC<CommandInputProps> = (props) => {
  return <input {...props} placeholder="CommandInput" />;
};

export const CommandEmpty: React.FC<CommandProps> = ({ children, ...props }) => {
  return <div {...props}>CommandEmpty: {children}</div>;
};

export const CommandGroup: React.FC<CommandProps> = ({ children, ...props }) => {
  return <div {...props}>CommandGroup: {children}</div>;
};

export const CommandItem: React.FC<CommandProps> = ({ children, ...props }) => {
  return <div {...props}>CommandItem: {children}</div>;
};
