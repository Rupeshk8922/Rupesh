import { Navigate } from "react-router-dom";
import { useSubscription } from "../contexts/SubscriptionContext";
import NoAccessPage from "../pages/NoAccessPage"; // Adjust the path as needed\nimport { useAuth } from "../contexts/authContext.jsx"; // Corrected import of useAuth\n
import { useState, useEffect } from "react"; // Import useState and useEffect
const ProtectedRoute = ({ children, requiredRole, requiredSubscription }) => {const { currentUser, userRole, authIsReady } = useauthContext(); // Get currentUser, userRole, and authIsReady from useAuthContext
  const { subscriptionStatus, subscriptionLoading } = useSubscription(); // Get subscriptionStatus and loading state
  const [loading, setLoading] = useState(true); // State to track overall loading

  useEffect(() => {
    // Set loading to false when authentication, subscription, and user data are ready
    if (!authIsReady && !subscriptionLoading && userRole !== undefined) {
      setLoading(false);
    }
  }, [authIsReady, subscriptionLoading, userRole]);

  // Show a loading indicator while data is loading
  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  // Check authentication
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role access
  if (requiredRole && userRole !== requiredRole) {
    return <NoAccessPage message={`You need to be a ${requiredRole} to access this page.`} />;
  }

  // Check subscription status if required
  if (requiredSubscription && subscriptionStatus !== 'active') {
    return <Navigate to="/subscription" replace />;
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
