import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const ICONS = {
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'success' | 'warning' | 'error';
  message?: string;
  className?: string;
}

/**
 * Alert component with optional type (info, success, warning, error).
 * @param {string} type - Alert type, determines icon and color.
 * @param {string} message - Alert content.
 * @param {string} className - Additional Tailwind classes.
 */
const Alert: React.FC<AlertProps> = ({ type = 'info', message = '', className = '', ...props }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-sm border ${
        {
          info: 'bg-blue-50 border-blue-200',
          success: 'bg-green-50 border-green-200',
          warning: 'bg-yellow-50 border-yellow-200',
          error: 'bg-red-50 border-red-200',
        }[type]
      } ${className}`}
      role="alert"
      {...props}
    >
      <div>{ICONS[type]}</div>
      <div className="text-sm text-gray-800">{message}</div>
    </div>
  );
};

const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h5>
);

const AlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

export {
  Alert,
  AlertTitle,
  AlertDescription,
};

export default Alert;