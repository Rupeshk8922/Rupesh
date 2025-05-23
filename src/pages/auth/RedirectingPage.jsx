import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material'; // Optional spinner

const RedirectingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 500); // Delay 0.5 seconds for better UX

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="text-center mt-20">
      <CircularProgress />
      <p className="mt-4 text-lg">Redirecting...</p>
    </div>
  );
};

export default RedirectingPage;
