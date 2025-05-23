import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup-company');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome to Empact CRM!
      </h1>
      <div className="space-x-4">
        <button
          onClick={handleLoginClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Login for existing users"
        >
          Existing User → Login
        </button>
        <button
          onClick={handleSignupClick}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label="Sign up for new users"
        >
          New User? → Sign Up
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
