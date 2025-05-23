import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import your Firebase functions here, e.g.:
// import { verifyCompany } from '../firebase/auth';

function VerifyCompanyPage() {
  const [companyId, setCompanyId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!companyId.trim()) {
      newErrors.companyId = 'Company ID is required';
    }
    if (!verificationCode.trim()) {
      newErrors.verificationCode = 'Verification Code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'companyId') {
      setCompanyId(value);
    } else if (name === 'verificationCode') {
      setVerificationCode(value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    switch (name) {
      case 'companyId':
        newErrors.companyId = !value.trim() ? 'Company ID is required' : '';
        break;
      case 'verificationCode':
        newErrors.verificationCode = !value.trim() ? 'Verification Code is required' : '';
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validateForm()) {
      setSubmissionError('Please fix the errors above.');
      return;
    }

    setLoading(true);
    try {
      // Replace with your actual verification logic
      // const success = await verifyCompany(companyId, verificationCode);
      const success = true; // Placeholder

      if (success) {
        console.log('Company verified successfully!');
        // Optional: Store verification status or token
        // Navigate to login or a success page
        navigate('/login-user');
      } else {
        setSubmissionError('Invalid Company ID or Verification Code.');
      }

    } catch (error) {
      console.error('Verification error:', error);
      setSubmissionError(error.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Verify Company</h2>

      {submissionError && (
        <p className="text-red-600 text-center mb-4">{submissionError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Company ID */}
        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
            Company ID
          </label>
          <input
            type="text"
            id="companyId"
            name="companyId"
            value={companyId}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
              ${errors.companyId ? 'border-red-600 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
          />
          {errors.companyId && <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>}
        </div>

        {/* Verification Code */}
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            name="verificationCode"
            value={verificationCode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
              ${errors.verificationCode ? 'border-red-600 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
          />
          {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Company'}
        </button>
      </form>
    </div>
  );
}

export default VerifyCompanyPage;