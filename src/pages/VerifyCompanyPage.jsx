import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import useOtpVerification from '../hooks/useOtpVerification';

function VerifyCompanyPage() {
  const { otp, setOtp, isSubmitting, error, message, handleVerifyOtp } =
    useOtpVerification();
  const [formError, setFormError] = useState(null); // Local state for form validation errors

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!otp) {
      setFormError('OTP is required.');
      return;
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setFormError('OTP must be exactly 6 digits.');
      return;
    }

    setFormError(null); // Clear previous form errors

    // In a real app, you'd get the companyId from the previous page or local storage
    // For now, we'll use a placeholder.
    const companyId = 'placeholderCompanyId'; // Replace with actual logic to get companyId

    const success = await handleVerifyOtp(companyId, otp);
    if (success) {
      setTimeout(() => navigate('/'), 2000); // Redirect to login page after success
    }
  };

  return (
    <div className="verify-company-page">
      <div className="form-container">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Company</h2>
        {message && <p className="success-message">{message}</p>}
        {formError && <p className="text-red-600 text-sm">{formError}</p>} {/* Display form validation errors */}
        {error && <p className="text-red-600 text-sm">{error}</p>} {/* Display hook (API) errors */}
        <form onSubmit={handleSubmit} className="verify-form">
          <div className="input-group">
            <label htmlFor="otp" className="input-label">
              OTP
            </label>
            <input
              type="number" // Use type="number" for better mobile keyboards
              id="otp"
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              pattern="\d{6}" // Strictly enforce exactly 6 digits
            />
          </div>
          <button type="submit" className="btn" disabled={isSubmitting}>
            Verify OTP
          </button>
          <p className="login-link">
            Go back to{' '}
            <Link to="/" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default VerifyCompanyPage;