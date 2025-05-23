import React, { FC, FormHTMLAttributes } from 'react';

const Form: FC<FormHTMLAttributes<HTMLFormElement>> = (props) => {
 return <form {...props}>{props.children}</form>;
};

const FormField: FC<any> = ({ children, ...props }) => {
 return (
 <div {...props}>{children}</div>
 );
};

const FormControl: FC<any> = ({ children, ...props }) => {
 return (
 <div {...props}>{children}</div>
 );
};

const FormItem: FC<any> = ({ children, ...props }) => {
 return (
 <div {...props}>{children}</div>
 );
};

const FormLabel: FC<any> = ({ children, ...props }) => {
 return (
 <label {...props}>{children}</label>
 );
};

const FormMessage: FC<any> = ({ children, ...props }) => {
 return (
 <p {...props}>{children}</p>
 );
};

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };