import { Navigate } from "react-router-dom";
import { useSubscription } from "../contexts/SubscriptionContext";
import NoAccessPage from "../pages/NoAccessPage"; // Adjust the path as needed
import { useAuth } from "../contexts/authContext.jsx"; // Corrected import of useAuth

import { useState, useEffect } from "react"; // Import useState and useEffect
const ProtectedRoute = ({ children, requiredRole, requiredSubscription }) => {
  const { user, userRole, authIsFullyLoaded, subscriptionStatus, userDataLoading } = useAuth(); // Get necessary state from useAuth

  // Combine loading states
  const isLoading = !authIsFullyLoaded || userDataLoading;

  // Show a loading indicator while data is loading
  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  // Check authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role access
  if (requiredRole && userRole !== requiredRole) {
    return <NoAccessPage message={`You need to be a ${requiredRole} to access this page.`} />;
  }

  // Check subscription status if required
  // Assuming subscriptionStatus is available in useAuth after data fetching
  if (requiredSubscription && subscriptionStatus !== 'active') {
    return <Navigate to="/upgrade-plan" replace />; // Redirect to upgrade page
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
