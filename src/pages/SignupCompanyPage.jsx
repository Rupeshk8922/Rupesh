import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Assuming you are using Firebase Auth
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config'; // Assuming db is exported from your config

// Define SignupCompanyPage component
function SignupCompanyPage() {
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [companyContactNumber, setCompanyContactNumber] = useState(''); // Company Contact Number for Step 1

  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');

  // State for validation errors
  // Responsiveness Comment: Ensure error messages are clearly visible and don't disrupt layout on small screens.
  // Tailwind classes like text-red-500 and text-sm are already used, which is good.
  const [companyNameError, setCompanyNameError] = useState('');

  const [adminNameError, setAdminNameError] = useState('');
  const [adminEmailError, setAdminEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [companyContactNumberError, setCompanyContactNumberError] = useState(''); // Validation for Company Contact Number (Step 1)
  const [pocContactNumber, setPocContactNumber] = useState(''); // POC Contact Number
  const [pocContactNumberError, setPocContactNumberError] = useState(''); // Validation for POC Contact Number (Step 2)

  // State for loading and general errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for success message
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

  // State to track the current step of the form
  const [currentStep, setCurrentStep] = useState(1);
  // Responsiveness Comment: The multi-step form structure helps manage complexity on small screens
  // by presenting only one step at a time.

  const [agreeToTerms, setAgreeToTerms] = useState(false); // State for Agree to Terms checkbox
  // --- Step Navigation ---
  const nextStep = () => {
    let isValid = true;
console.log('Validating Step 1');
    if (currentStep === 1) {
      validateCompanyName(companyName);
      validateAdminEmail(adminEmail);
      validateCompanyContactNumber(companyContactNumber);
      if (companyNameError || adminEmailError || companyContactNumberError) { // Assuming these state updates happen before the check
 isValid = false; // The state updates are asynchronous, this check might not reflect the latest state immediately
      }
      if (isValid) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const [showVerificationMessage, setShowVerificationMessage] = useState(false); // State for verification message

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Final validation before submission
    validateAdminName(adminName);
    validatePassword(password);
    validatePocContactNumber(pocContactNumber);
    if (!agreeToTerms) {
      setError('You must agree to the Terms and Privacy Policy.');
      return;
    }
    if (adminNameError || passwordError || pocContactNumberError) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
      const adminUser = userCredential.user;

      // 3. Create /companies/{companyId}
      const companyRef = await addDoc(collection(db, 'companies'), {
        name: companyName,
        adminId: adminUser.uid,
        createdAt: serverTimestamp(),
        companyContactNumber: companyContactNumber,
        // Number of Employees is optional, add if you have a field for it
      });

      // 4. Get the generated companyId
      const companyId = companyRef.id;

      // 5. Create /users/{uid}
      await setDoc(doc(db, 'users', adminUser.uid), {
        companyId: companyId,
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      // 6. Create /companies/{companyId}/users/{uid}
      await setDoc(doc(db, 'companies', companyId, 'users', adminUser.uid), {
        name: adminName,
        email: adminEmail,
        pocContactNumber: pocContactNumber,
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      // 7. Create blank subscriptions/{companyId} (status: inactive)
      await setDoc(doc(db, 'subscriptions', companyId), {
        status: 'inactive',
        plan: null, // or 'free-trial' etc.
        expiryDate: null,
      });

      // 9. Send email verification
      await sendEmailVerification(adminUser);

      // 10. Redirect to verify email page
      navigate('/verify-email');

    } catch (err) {
      console.error('Company signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Any initialization or side effects related to form steps or data fetching could go here.
  }, [currentStep]); // Effect runs when currentStep changes

  // Validation functions
  const validateCompanyName = (name) => {
    if (!name.trim()) {
      setCompanyNameError('Company name is required.');
    } else {
      setCompanyNameError('');
    }
  };

  const validateAdminName = (name) => {
    if (!name.trim()) {
      setAdminNameError('POC name is required.');
    } else {
      setAdminNameError('');
    }
  };

  const validateAdminEmail = (email) => {
    if (!email.trim()) {
      setAdminEmailError('Company email is required.');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setAdminEmailError('Invalid email format.');
    } else {
      setAdminEmailError('');
    }
  };

  const validateCompanyContactNumber = (number) => {
    if (!number.trim()) {
      setCompanyContactNumberError('Company contact number is required.');
    } else {
      setCompanyContactNumberError('');
    }
  };

  const validatePocContactNumber = (number) => {
    if (!number.trim()) {
      setPocContactNumberError('POC contact number is required.');
    } else {
      setPocContactNumberError('');
    }
  };

  const validatePassword = (pass) => {
    if (!pass) {
      setPasswordError('Password is required.');
    } else if (pass.length < 6) { // Firebase Auth requires at least 6 characters
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  };

  return (
    // Responsiveness Comment: The main container should have responsive padding.
    // Tailwind's default padding classes (e.g., p-4) work well here.
    <div>
      <h2>Company Signup</h2>
      {/* Implement a visual progress bar here or step indicator */}
      <div>
        {/* Responsiveness Comment: Ensure step indicators are clear on small screens. */}
        {currentStep === 1 && <span>Step 1 of 2</span>}
        {currentStep === 2 && <span>Step 2 of 2</span>}
      </div>

      {/* Multi-step Form */}
      <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()}> {/* Only submit on step 2 */}
        {currentStep === 1 && (
          <div className="form-step-content" style={{ padding: '20px', border: '1px solid #eee' }}>
            {/* Responsiveness Comment: Review padding and border for different screen sizes. */}
            {/* Using Tailwind classes like p-4 sm:p-6 and border instead of inline styles is recommended. */}
            <h3>Step 1: Company Profile</h3>
            <div style={{ marginBottom: '15px' }}>
              {/* Responsiveness Comment: Ensure label is a block element so it stacks above the input on small screens. */}
              {/* The existing block class is good. */}
              <label htmlFor="companyName">Company Name:</label>
              <input
                // Responsiveness Comment: Input field should take full width on small screens.
                // Add 'w-full' class here.
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onBlur={() => validateCompanyName(companyName)}
                required
                title="Enter the official name of your company."
                disabled={loading}
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities (e.g., ml-2).
                style={{ marginLeft: '10px' }}
              />
              {/* Responsiveness Comment: Error message styling (color, font size) is important for readability on mobile. */}
              {companyNameError && <p style={{ color: 'red', fontSize: '0.8em' }}>{companyNameError}</p>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="adminEmail">Company Email (Login Email):</label>
              <input
                type="email"
                id="adminEmail"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                onBlur={() => validateAdminEmail(adminEmail)}
                required
                title="This email will be used as the login email for the admin account."
                disabled={loading}
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities.
                style={{ marginLeft: '10px' }}
              />
              {adminEmailError && <p style={{ color: 'red', fontSize: '0.8em' }}>{adminEmailError}</p>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="companyContactNumber">Company Contact Number:</label>
              <input
                type="text" // Or tel, depending on desired browser behavior
                id="companyContactNumber"
                value={companyContactNumber}
                onChange={(e) => setCompanyContactNumber(e.target.value)}
                onBlur={() => validateCompanyContactNumber(companyContactNumber)}
                required
                title="Enter the main contact number for your company."
                disabled={loading}
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities.
                style={{ marginLeft: '10px' }}
              />
              {companyContactNumberError && <p style={{ color: 'red', fontSize: '0.8em' }}>{companyContactNumberError}</p>}
            </div>
            {/* Optional: Number of Employees field */}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="numberOfEmployees">Number of Employees (Optional):</label>
              <input
                type="number"
                id="numberOfEmployees"
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities.
                style={{ marginLeft: '10px' }}
                // Add state and onChange for numberOfEmployees if you want to capture it
                title="Optionally, enter the approximate number of employees in your company."
                disabled={loading}
              />
            </div>
            {/* Optional: Agreement checkbox placeholder */}
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step-content" style={{ padding: '20px', border: '1px solid #eee' }}>
            <h3>Step 2: Admin (POC) Profile</h3>
            {/* Responsiveness Comment: Review padding and border for different screen sizes. */}
            {/* Using Tailwind classes is recommended. */}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="adminName">POC Name:</label>
              <input
                type="text"
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                onBlur={() => validateAdminName(adminName)}
                required
                title="Enter the name of the primary administrator (Point of Contact)."
                disabled={loading}
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities.
                style={{ marginLeft: '10px' }}
              />
              {adminNameError && <p style={{ color: 'red', fontSize: '0.8em' }}>{adminNameError}</p>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword(password)}
                required
                title="Create a password for the admin account (minimum 6 characters)."
                disabled={loading}
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities.
                style={{ marginLeft: '10px' }}
              />
              {passwordError && <p style={{ color: 'red', fontSize: '0.8em' }}>{passwordError}</p>}
              {/* Placeholder for Password Strength Meter */}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="pocContactNumber">POC Contact Number:</label>
              <input
                type="text"
                id="pocContactNumber"
                value={pocContactNumber}
                onChange={(e) => setPocContactNumber(e.target.value)}
                onBlur={() => validatePocContactNumber(pocContactNumber)}
                required
                title="Enter the contact number for the primary administrator."
                disabled={loading}
                // Responsiveness Comment: Avoid inline styles like marginLeft. Use Tailwind margin utilities.
                style={{ marginLeft: '10px' }}
              />
              {pocContactNumberError && <p style={{ color: 'red', fontSize: '0.8em' }}>{pocContactNumberError}</p>}
            </div>
            {/* Agreement to Terms and Privacy Policy (checkbox) - Crucial for GDPR/privacy */}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="agreeToTerms">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  disabled={loading}
                  title="You must agree to the Terms and Privacy Policy to sign up."
                />
                Agree to Terms and Privacy Policy
                {/* Responsiveness Comment: Ensure checkbox and label are aligned and readable on small screens. */}
                {/* Tailwind's flex or inline-flex utilities might be helpful here if needed for alignment. */}
              </label>
            </div>
            {/* Optional: Agreement checkbox placeholder */}
          </div>
        )}

        {/* Navigation Buttons */}
        {/* Responsiveness Comment: Ensure buttons are full width or stack appropriately on small screens. */}
        {/* Use Tailwind classes like 'w-full' on buttons for full width or ensure their container uses flex-col on small screens. */}
        {currentStep > 1 && <button type="button" onClick={prevStep} disabled={loading}>Back</button>}
        {currentStep < 2 && <button type="button" onClick={nextStep} disabled={loading}>Next</button>}
        {currentStep === 2 && (
          // Responsiveness Comment: Apply responsive styling to the submit button.
          // Use Tailwind classes for padding, background color, rounded corners, and hover/disabled states.
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        )}
      </form>
      {/* Display success or error messages */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}


export default SignupCompanyPage;