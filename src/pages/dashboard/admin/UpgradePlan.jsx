// src/pages/dashboard/admin/UpgradePlan.jsx

import React from 'react';
// Example: import your hooks with .jsx extension if renamed
import { useAuth } from '../../../hooks/useAuth.jsx';

export default function UpgradePlan() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Upgrade Your Plan</h1>
      <p className="mb-6 text-gray-700">
        Welcome, {user?.name || 'User'}! This is where you can upgrade your subscription plan.
      </p>
      <div className="border border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-400">
        Upgrade Plan (Placeholder)
      </div>
    </div>
  );
}
