// src/hooks/useOtpVerification.js
import { useState } from 'react';

/**
 * Custom hook to handle OTP verification via Cloud Function.
 * Provides state management, error handling, and optional callbacks.
 */
const useOtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  /**
   * Verifies the OTP with the backend.
   *
   * @param {string} companyId - The associated company ID.
   * @param {string} [otpOverride] - Optional OTP override, defaults to internal state.
   * @param {{
   *   onSuccess?: Function,
   *   onError?: Function
   * }} [callbacks] - Optional success and error callbacks.
   * @returns {Promise<boolean>} - Returns true if verified, false otherwise.
   */
  const handleVerifyOtp = async (
    companyId,
    otpOverride,
    { onSuccess, onError } = {}
  ) => {
    const otpToVerify = otpOverride || otp;

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        'https://verifyotp-7fciy242nq-uc.a.run.app', // Replace with actual Cloud Function URL
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: otpToVerify, companyId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const successMsg = data.message || 'OTP verified successfully.';
        setMessage(successMsg);
        onSuccess?.(data);
        return true;
      } else {
        const errorMsg = data.message || 'OTP verification failed.';
        setError(errorMsg);
        onError?.(data);
        return false;
      }
    } catch (err) {
      const fallbackMsg = err.message || 'An unexpected error occurred.';
      setError(fallbackMsg);
      onError?.(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resets OTP, error, and message states.
   */
  const reset = () => {
    setOtp('');
    setError(null);
    setMessage(null);
  };

  return {
    otp,
    setOtp,
    isSubmitting,
    error,
    message,
    handleVerifyOtp,
    reset,
  };
};

export default useOtpVerification;
