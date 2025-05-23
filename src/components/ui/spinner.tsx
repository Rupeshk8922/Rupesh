import React from 'react';
const Spinner: React.FC = () => {
  return (
    <div style={{
      border: '4px solid #f3f3f3', /* Light grey */
      borderTop: '4px solid #3498db', /* Blue */
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      animation: 'spin 2s linear infinite',
      display: 'inline-block', // Added to keep it in line with text
      verticalAlign: 'middle', // Added to align it vertically
    }}>
      {/* This style block is a simple way to include keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export { Spinner };