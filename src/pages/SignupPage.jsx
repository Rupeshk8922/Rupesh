import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/authContext.jsx';
export default function SignupCompanyPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('Admin'); // Default role
  const [loading, setLoading] = useState(false); // Added loading state 
  const [globalError, setGlobalError] = useState(''); // Added global error state for signup
  const [errors, setErrors] = useState({}); // Added errors state

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setLoading(true); // Start loading

    try {
      const newErrors = {};

      if (currentStep === 1) {
        // Basic validation for step 1
        if (!email.trim()) {
          newErrors.email = 'Email is required.';
        }
        if (!email.includes('@')) {
          newErrors.email = 'Please enter a valid email address.';
        }
        if (!password) {
          newErrors.password = 'Password is required.';
        }
        if (!confirmPassword) {
          newErrors.confirmPassword = 'Confirm password is required.';
        }
        if (password && confirmPassword && password !== confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          setLoading(false); // Stop loading if there are errors
          return; // Stop submission if there are errors
        }

        // Move to the next step
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Basic validation for step 2
        if (!companyName.trim()) {
          newErrors.companyName = 'Company Name is required.';
        }
        if (!adminName.trim()) {
          newErrors.adminName = 'Your Name is required.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          setLoading(false); // Stop loading if there are errors
          return; // Stop submission if there are errors
        }
        // Proceed with signup (this is where Firebase auth would happen)
        await signup(email, password, companyName, adminName, adminRole); // Call the signup function from context

        // Redirect to login page after successful signup
        navigate('/login');
      }
      // For Step 3 (Verify Email), there are no form inputs to validate.
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message) {
        setGlobalError(err.message); // Set the global error state with the error message
      } else {
        setGlobalError('An unexpected error occurred during signup.');
      }
      // You might want to handle specific Firebase auth errors here and set errors accordingly
      // For now, we'll just log it and the user will see the loading disappear.
      // A more robust approach would be to display the error message to the user.
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // This was previously used for general errors, but now we use the 'errors' state for field-specific feedback.
  // We can keep this for unexpected errors during the async process if needed, or remove it.
  // For now, we'll rely on the field-specific errors.

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sign Up</h1>
      <p>Step {currentStep} of 2</p>

      {globalError && <p style={{ color: 'red' }}>{globalError}</p>} {/* Display global error */}
      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}

      <form onSubmit={handleStepSubmit}>
        {currentStep === 1 && (
          <>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading} // Disable while loading
              />
              {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading} // Disable while loading
              />
              {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading} // Disable while loading
              />
              {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
            </div>
            <button type="submit" disabled={loading}>Next</button> {/* Disable button while loading */}
          </>
        )}

        {currentStep === 2 && (
          <>
            <div>
              <label htmlFor="companyName">Company Name:</label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading} // Disable while loading
              />
              {errors.companyName && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.companyName}</span>}
            </div>
            <div>
              <label htmlFor="adminName">Your Name:</label>
              <input
                type="text"
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                disabled={loading} // Disable while loading
              />
              {errors.adminName && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.adminName}</span>}
            </div>
            <div>
              <label htmlFor="adminRole">Your Role:</label>
              {/* You might want a dropdown for roles later */}
              <input
                type="text"
                id="adminRole"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                required
                disabled={loading} // Disable while loading
              />
              {errors.adminRole && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.adminRole}</span>}
            </div>
            <button type="submit" disabled={loading}>Sign Up</button> {/* Disable button while loading */}
          </>
        )}
      </form>

      {loading && <p>Loading...</p>} {/* Show loading message */}
    </div>
  );
}