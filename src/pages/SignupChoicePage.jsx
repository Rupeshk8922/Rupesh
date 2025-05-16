import React from 'react'; // Assuming React is necessary for JSX
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

const SignupChoicePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Choose Signup Type</h1>
      <button onClick={() => navigate('/new-company')}>
        New Company
      </button>
      <button onClick={() => navigate('/login')}>
        Existing User Login
      </button>
    </div>
  );
};

export default SignupChoicePage;
