import {
  Routes,
  Route
} from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AddEventPage from './pages/dashboard/crm/events/AddEventPage';
import PrivateRoute from './components/routes/PrivateRoute'; // Corrected import
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import OutreachDashboard from './pages/dashboard/outreach/OutreachDashboard';
import CSRDashboard from './pages/dashboard/csr/CSRDashboard';
import VolunteerDashboard from './pages/dashboard/volunteer/VolunteerDashboard';
import TelecallerDashboard from './pages/dashboard/telecaller/TelecallerDashboard';
import ManagerDashboard from './pages/dashboard/manager/ManagerDashboard'; // Corrected import
import UserDashboardPage from './pages/UserDashboardPage'; // Add import for UserDashboardPage
import routeConfig from './routesConfig';
function App() {
  return (
    ErrorBoundary >
    <
    BrowserRouter >
    <
    AuthProvider >
    <
    Routes > {
      /* Use PrivateRoute for protected routes */ } {
      routeConfig.map((route, index) => ( <
        Route key = {
          index
        }
        path = {
          route.path
        }
        element = {
          route.isPublic ? ( <
            route.Component / >
          ) : ( <
            PrivateRoute element = { < route.Component / >
            }
            requiredRoles = {
              route.roles
            }
            />
          )
        }
        />
      ))
    } <
    /Routes> <
    /AuthProvider> <
    /BrowserRouter> <
    /ErrorBoundary>
  );
}

export default App;