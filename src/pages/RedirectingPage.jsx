import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="text-center mt-20">
      Redirecting...
    </div>
  );
};

export default RedirectingPage;