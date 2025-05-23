import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const RequireAuth = ({ children, allowedRoles = [] }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.user) {
    // Not logged in — redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(auth.role)) {
    // User is authenticated and role allowed
    return children;
  }

  // Authenticated but not authorized — redirect to dashboard or Unauthorized page
  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default RequireAuth;
