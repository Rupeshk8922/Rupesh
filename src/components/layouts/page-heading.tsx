import React from 'react';

type PageHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

const PageHeading = ({ children, className = '' }: PageHeadingProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

export default PageHeading;
