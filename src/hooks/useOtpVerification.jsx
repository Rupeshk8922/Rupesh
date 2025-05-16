// src/hooks/useOtpVerification.js
import { useState } from 'react';

const useOtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleVerifyOtp = async (companyId, otp) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        'https://verifyotp-7fciy242nq-uc.a.run.app', // Replace with your Cloud Function URL
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp, companyId }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'OTP verified successfully!');
        return true;
      } else {
        setError(data.message || 'OTP verification failed');
        return false;
      }
    } catch (err) {
      setError(err.message || 'An error occurred during OTP verification');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { otp, setOtp, isSubmitting, error, message, handleVerifyOtp };
};

export default useOtpVerification;