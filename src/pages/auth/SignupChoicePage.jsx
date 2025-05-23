import { Link } from 'react-router-dom';

const SignupChoicePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Choose Your Account Type
        </h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Are you signing up as a Company/NGO or as a Volunteer?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup-company">
            <button className="w-48 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Company / NGO Sign Up
            </button>
          </Link>
          <Link to="/signup-volunteer">
            <button className="w-48 px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100">
              Volunteer Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupChoicePage;
