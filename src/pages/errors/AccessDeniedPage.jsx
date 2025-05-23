import React from 'react';

const AccessDeniedPage = () => {
  return (
    <main
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center bg-gray-100 text-center px-4"
    >
      <div>
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
      </div>
    </main>
  );
};

export default AccessDeniedPage;
