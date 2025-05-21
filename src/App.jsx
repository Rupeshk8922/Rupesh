import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { routes, renderRoutes } from './routesConfig'; // Import routes and renderRoutes

// Keep necessary page imports for potential static usage within renderRoutes if needed

import RedirectingPage from './pages/RedirectingPage';
import ProtectedRoute from './components/ProtectedRoute'; // Optional: wrapper for auth

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Define public routes based on routesConfig
  const publicRoutes = routes
    .filter(route => route.isPublic)
    .map(route => route.path);
  

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, location.pathname, navigate]);

  useEffect(() => {
    if (user && location.pathname === '/login') {
      navigate('/redirecting', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Render routes from routesConfig */}
        {renderRoutes(routes)}
      </Routes>
    </React.Suspense>
  );
}

export default App;
