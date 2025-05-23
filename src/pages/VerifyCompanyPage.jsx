import { useState } from 'react';
import useOtpVerification from '../hooks/useOtpVerification';

function VerifyCompanyPage() {
  const { otp, setOtp, isSubmitting, error, message, handleVerifyOtp } =
    useOtpVerification();
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!otp) {
      setFormError('OTP is required.');
      return;
    }
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setFormError('OTP must be exactly 6 digits.');
      return;
    }

    setFormError(null);

    // TODO: Replace with actual logic to get companyId (from context, props, or storage)
    const companyId = 'placeholderCompanyId';

    await handleVerifyOtp(companyId, otp);
  };

  // Limit input to digits only, max length 6
  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  return (
    <div className="verify-company-page max-w-md mx-auto p-6">
      <div className="form-container bg-white shadow-md rounded p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Company</h2>

        {message && (
          <p className="success-message text-green-600 mb-2">{message}</p>
        )}
        {formError && <p className="text-red-600 text-sm mb-2">{formError}</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="verify-form space-y-4">
          <div className="input-group">
            <label htmlFor="otp" className="input-label block mb-1 font-semibold">
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              className="input-field border border-gray-300 rounded px-3 py-2 w-full"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              pattern="\d{6}"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit OTP"
              required
            />
          </div>
          <button
            type="submit"
            className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
          <p className="login-link mt-4 text-center text-sm">
            Go back to{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default VerifyCompanyPage;
