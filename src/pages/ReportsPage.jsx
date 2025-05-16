// src/pages/ReportsPage.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../contexts/authContext.jsx';

const ReportsPage = () => {
  // Placeholder data
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 278 },
    { name: 'May', value: 189 },
  ];

  // Placeholder for subscription loading and access control
  const subscriptionLoading = false;
  const hasAccess = true;

  return (
    <>
      {subscriptionLoading && <p className="p-4">Loading subscription status...</p>}

      {hasAccess ? (
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Reports Dashboard</h1>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="p-4 text-red-500 flex items-center justify-center min-h-[200px] text-center">
          You do not have access to view reports.
        </div>
      )}
    </>
  );
};

export default ReportsPage;
