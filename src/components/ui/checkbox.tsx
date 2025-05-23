import React, { FC, InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: FC<CheckboxProps> = ({ label, ...inputProps }) => {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <input type="checkbox" {...inputProps} />
      {label && <span style={{ marginLeft: 8 }}>{label}</span>}
    </label>
  );
};

export { Checkbox };
