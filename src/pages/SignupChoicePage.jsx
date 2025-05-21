import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignupChoicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-choice-page">
      <h1>Choose Signup Type</h1>
      <div className="buttons">
        <button
          type="button"
          onClick={() => navigate('/new-company')}
          className="btn btn-primary"
        >
          New Company Signup
        </button>
        <button
          type="button"
          onClick={() => navigate('/signup-volunteer')}
          className="btn btn-secondary"
        >
          Volunteer Signup
        </button>
      </div>
    </div>
  );
};

export default SignupChoicePage;
