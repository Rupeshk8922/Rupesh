import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const RequireAuth = ({ children, allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // Check if user is authenticated and has one of the allowed roles
  if (auth && auth.user && allowedRoles.includes(auth.role)) {
    return children; // Render the protected content
  }

  // If not authenticated, redirect to login page
  if (!auth?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have allowed role, redirect to unauthorized page or dashboard
  // Assuming a dashboard path for authenticated but unauthorized users
  // You might want a dedicated Unauthorized page
  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default RequireAuth;