import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useCompanyLogin } from "../hooks/useCompanyLogin"; // Import useCompanyLogin
import useModal from '../hooks/useModal.jsx'; // Assuming you still need this
 const LoginPage = () => {
  const navigate = useNavigate();
  // Use user and loading from useauthContext for initial auth check
  const { user, loading } = useAuth();
  const { isLoading, error, login, subscriptionStatus, role, sendPasswordReset } = useCompanyLogin();
  const { showModal } = useModal();


  const [localEmail, setLocalEmail] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [formValidationErrors, setFormValidationErrors] = useState({});

  console.log("LoginPage user:", user, "loading:", loading); // Log states from useauthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};
    if (!localEmail) formErrors.email = 'Email is required';
    if (!localPassword) formErrors.password = 'Password is required';

    setFormValidationErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      // Use the login function from useCompanyLogin
      await login(localEmail, localPassword);
    }
  };

  // useEffect to handle redirection after successful login and data fetching in useCompanyLogin
  useEffect(() => {
    // Check if not initially loading (from useauthContext) and user is logged in (from useauthContext)
    // Also check for the role and subscription status being available from useCompanyLogin
    if (!loading && user && role && subscriptionStatus) {
      if (subscriptionStatus === 'trialExpired') {
        showModal({
          title: "Trial Expired",
          message: "Your trial has ended. You&apos;re now on a limited Free Plan.",
          actions: [
            {
              label: "Continue with Free Plan",
              action: () => navigate('/free-dashboard')
            },
            {
              label: "Upgrade Now",
              action: () => navigate('/subscription')
            }
          ]
        });
      } else if (['trialActive', 'paid', 'free'].includes(subscriptionStatus)) {
        if (role === 'admin' || role === 'Manager') {
          navigate('/dashboard/admin');
        } else if (role === 'Outreach Officer') {
          navigate('/dashboard/outreach');
        } else if (role === 'csr') {
          navigate('/dashboard/csr')
        } else if (role === 'volunteer') {
          navigate('/dashboard/volunteer');
        } else if (role === 'telecaller') {
          navigate('/dashboard/telecaller');
        } else {
          navigate('/no-access');
        }
      }
    }
  }, [loading, user, subscriptionStatus, role, navigate, showModal]); // Added user to dependencies


  // Render null or a loading indicator while auth is loading (using loading from useauthContext)
  if (loading) return <div>Loading Authentication...</div>;

  // Render the login form only if auth is not loading AND there is no authenticated user
  if (!user && !loading) return (
    // Mobile Responsiveness: Consider wrapping the form in a container with padding (e.g., p-4)
    // and possibly limiting its max-width and centering it on larger screens (e.g., max-w-sm mx-auto)
    // The form itself will likely stack elements well on small screens due to block-level inputs.
    // Ensure spacing between form groups is handled.
    <form onSubmit={handleSubmit}>
      <h2>Login</h2> {/* Added a heading for clarity */}
      <div className='input-group'>
        <label htmlFor='email' className='input-label'>Email</label>
        <input
          type="text"
          id="email"
          placeholder="Enter your email"
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          className="input-field"
        />
        {formValidationErrors.email && <span className="text-red-600 text-sm mt-1">{formValidationErrors.email}</span>}
      </div>

      <div className='input-group'>
        <label htmlFor='password' className='input-label'>Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={localPassword}
          onChange={(e) => setLocalPassword(e.target.value)}
          className="input-field"
        />
        {formValidationErrors.password && <span className="text-red-600 text-sm mt-1">{formValidationErrors.password}</span>}
      </div>

      {/* Use isLoading from useCompanyLogin for the button */}
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <p>
        <button type="button" onClick={() => sendPasswordReset(localEmail)} className="link-btn">
          Forgot Password?
        </button>
      </p>

      {/* Use error from useCompanyLogin for displaying login errors */}
      {error && <div className="error-message-box">{error}</div>}

      <p className='signup-link'>
        Don&apos;t have an account?{' '}
        <Link to='/new-company' className='link-btn'>Sign up</Link>
      </p>
    </form>
  );

  // If auth is not loading and a user exists, we can show a redirecting message
  // while the useEffect handles the actual navigation.
  if (user) return <div>Redirecting...</div>;

  // Fallback (should not be reached in normal flow)
  return null;
};

export default LoginPage;
