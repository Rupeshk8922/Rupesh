import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function NewCompanyPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    officialEmail: '',
    password: '',
    pocName: '',
    pocMobile: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [signupError, setSignupError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isPasswordValid = formData.password.length >= 8;
  const isFormValid =
    Object.values(formData).every((val) => val.trim() !== '') && isPasswordValid;

  const handleCompanySignup = async (e) => {
    e.preventDefault();
    const errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    if (!emailRegex.test(formData.officialEmail)) {
      errors.officialEmail = 'Please enter a valid official email address.';
    }

    if (!phoneRegex.test(formData.pocMobile)) {
      errors.pocMobile = 'Please enter a valid mobile number.';
    }

    if (!isPasswordValid) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    try {
      const companiesRef = collection(db, 'companies');
      const q = query(companiesRef, where('officialEmail', '==', formData.officialEmail.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        errors.officialEmail = 'This email is already registered with a company.';
      }
    } catch (queryError) {
      console.error('Error checking existing company email:', queryError);
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const createCompany = httpsCallable(functions, 'api');
      const result = await createCompany(formData);
      console.log('Backend function result:', result.data);

      // Force refresh and wait for custom claims
      await auth.currentUser.getIdToken(true);
      const tokenResult = await auth.currentUser.getIdTokenResult(true);

      if (tokenResult.claims?.companyId) {
        console.log('Company ID claim present:', tokenResult.claims.companyId);
        navigate('/company-dashboard');
      } else {
        console.warn('Company ID claim missing, delaying navigation...');
        setTimeout(() => navigate('/company-dashboard'), 2000);
      }
    } catch (error) {
      console.error('Signup error:', error.message);
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      setSignupError(errorMessage);
      alert(`Signup failed: ${errorMessage}`);
    } finally {
      setLoading(false);
      setFormData({
        companyName: '',
        officialEmail: '',
        password: '',
        pocName: '',
        pocMobile: '',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Your Company Account</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Register your organization to manage teams, outreach, and impact from one dashboard.
        </p>

        <form onSubmit={handleCompanySignup} noValidate>
          {[
            { label: 'Company Name', name: 'companyName', type: 'text', placeholder: 'Your Company' },
            { label: 'Official Email', name: 'officialEmail', type: 'email', placeholder: 'company@example.com' },
            {
              label: 'Password',
              name: 'password',
              type: showPassword ? 'text' : 'password',
              placeholder: '••••••••',
            },
            { label: 'Point of Contact Name', name: 'pocName', type: 'text', placeholder: 'John Doe' },
            { label: 'Point of Contact Mobile', name: 'pocMobile', type: 'tel', placeholder: '9876543210' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                className={`w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors[name] ? 'border-red-500' : ''
                }`}
                value={formData[name]}
                onChange={handleChange}
                required
              />
              {name === 'password' && (
                <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
              )}
              {validationErrors[name] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors[name]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-md transition duration-200 ${
              loading || !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Registering...' : 'Register Company'}
          </button>

          {signupError && (
            <p className="text-red-500 text-sm mt-4 text-center">{signupError}</p>
          )}

          <p className="text-sm text-center mt-4 text-gray-600">
            Already registered?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
