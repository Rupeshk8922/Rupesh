import React, { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Skeleton component with shimmer effect using Tailwind CSS.
 * Usage:
 * <Skeleton className="w-full h-6 rounded-lg mb-4" />
 */
const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 animate-pulse ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-shimmer" />
    </div>
  );
};

export { Skeleton };
