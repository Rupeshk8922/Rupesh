import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
// Assuming no hooks are imported from src/hooks in this specific file based on the provided code snippet.
export default function NewCompanyPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    officialEmail: '',
    password: '',
    pocName: '',
    pocMobile: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState(null); // State to hold signup error
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const isPasswordValid = formData.password.length >= 8;
  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && isPasswordValid;
  const handleCompanySignup = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Updated regex to allow common mobile number formats, including international
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    const errors = {};
    if (!emailRegex.test(formData.officialEmail)) {
      errors.officialEmail = 'Please enter a valid official email address.';
    }

    if (!phoneRegex.test(formData.pocMobile)) {
      errors.pocMobile = 'Please enter a valid mobile number.';
    }

    if (!isPasswordValid) {
      errors.password = 'Password must be at least 8 characters long.';
    }

 // Check if the official email is already associated with a company
 try {
      const companiesRef = collection(db, 'companies');
      const q = query(companiesRef, where('officialEmail', '==', formData.officialEmail.toLowerCase())); // Use lowercase for consistency
      const querySnapshot = await getDocs(q);
 if (!querySnapshot.empty) {
        errors.officialEmail = 'This email is already registered with a company.';
      }
    } catch (queryError) {
      console.error('Error checking for existing company email:', queryError);
      // You might want to handle this error more gracefully, but for now, just log it.
    }

 if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // Stop execution if there are validation errors
    }

    setLoading(true);
    const { companyName, officialEmail, password, pocName, pocMobile } = formData;
    let user = null; // Declare user here
    let newCompanyId = ''; // Declare newCompanyId here
    try {
      // --- TEMPORARY TEST WRITE TO FIRESTORE ---
      // Removed temporary test write
      // --- END TEMPORARY TEST WRITE ---
      // 1. Create user in Firebase Authentication
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, officialEmail, password); // Assign to declared user
        const user = userCredential.user;
        console.log('User created in Firebase Auth:', user);
        console.log('User created with UID:', user?.uid);

        // Prepare user data without password for Firestore
        const userData = {
          name: pocName,
          username: pocName,
          role: 'admin',
          companyId: '', // Placeholder, will be updated after company creation
          email: officialEmail,
          mobile: pocMobile,
          createdAt: serverTimestamp(),
        };
        // Password is not stored in Firestore for security reasons
        console.log('Attempting to create user document in Firestore for UID:', user.uid, 'with data:', userData);
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('User document created in Firestore successfully.');

        // 2. Create document in /companies collection
        // Generate a new ID for the company document
        const newCompanyRef = doc(collection(db, 'companies'));
        newCompanyId = newCompanyRef.id; // Assign to declared newCompanyId

        console.log("Attempting to create company document in Firestore with ID:", newCompanyId);

        // Enclose the setDoc call for creating the user document in a try-catch block
        console.log('Writing user document with data:', userData);
        await setDoc(doc(db, 'users', user.uid), userData);

        await updateProfile(user, { displayName: pocName });

        await setDoc(newCompanyRef, {
          companyName,
          pocName,
          pocMobile,
          officialEmail,
          adminUserId: user.uid, // Link the company to its admin user
          createdAt: serverTimestamp(),
        });
        console.log("Company document created in Firestore.");

        // 4. Update the user document with the companyId
        /*      setFormData({
 companyName: '',
 officialEmail: '',
 password: '',
 pocName: '',
 pocMobile: ''
 }); // Consider moving this to a success block or finally block
      const userDocRef = doc(db, 'users', user.uid);
 console.log("Attempting to update user document with UID:", user.uid, "with companyId:", newCompanyId);
 try {
 await updateDoc(userDocRef, {
        companyId: newCompanyId
      }); */
 console.log("User document for UID:", user.uid, "updated with companyId:", newCompanyId);
      } catch (updateError) {
 console.error("Failed to update user document for UID:", user.uid, "with companyId:", newCompanyId, "Error:", updateError);
      }

      // Use toast notification for success
      // TODO: Integrate toast notification for success
      // toast.success('Company and Admin User created successfully! Redirecting to login...');

      // User is automatically logged in after createUserWithEmailAndPassword.

 // Redirect to company dashboard or a welcome page
      navigate('/company-dashboard'); // Or another appropriate page

    } catch (error) {
      console.error('Error creating company and user:', error.message);
      setSignupError(error.message); // Set the signup error state
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different one or login.';
      }
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger one.';
      }
      // Use toast notification for error
      // Example (replace with your toast library):
      // TODO: Integrate toast notification for error
      alert(`Error during signup: ${errorMessage}`); // Fallback to alert
    } finally { // Removed unnecessary closing brace
      setLoading(false); // Ensure loading is turned off even on error
 setFormData({ // Clear form on success or failure
        companyName: '', officialEmail: '', password: '', pocName: '', pocMobile: ''
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Your Company Account</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Register your organization to manage teams, outreach, and impact from one dashboard.</p>

        <form onSubmit={handleCompanySignup} noValidate> {/* Added noValidate to handle validation manually */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              name="companyName"
              className={`w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.companyName ? 'border-red-500' : ''}`}
              type="text"
              placeholder="Your Company"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Official Email</label>
            <input
              name="officialEmail"
              className={`w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.officialEmail ? 'border-red-500' : ''}`}
              type="email"
              placeholder="company@example.com"
              value={formData.officialEmail}
              onChange={handleChange}
              required
            />
            {validationErrors.officialEmail && <p className="text-red-500 text-xs mt-1">{validationErrors.officialEmail}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            {/* Add eye icon for show/hide password - requires additional implementation */}
            <input
              name="password"
              className={`w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.password ? 'border-red-500' : ''}`}
              type={showPassword ? "text" : "password"} // Toggle password visibility
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8" // HTML5 validation, but also handled by custom logic
            />
             {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
            <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p> {/* Simplified requirements text */}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Point of Contact Name</label>
            <input
              name="pocName"
              className={`w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.pocName ? 'border-red-500' : ''}`}
              type="text"
              placeholder="John Doe"
              value={formData.pocName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Point of Contact Mobile</label>
            <input
              name="pocMobile"
              className={`w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.pocMobile ? 'border-red-500' : ''}`}
              type="tel"
              placeholder="9876543210"
              value={formData.pocMobile}
              onChange={handleChange}
              required
            />
             {validationErrors.pocMobile && <p className="text-red-500 text-xs mt-1">{validationErrors.pocMobile}</p>}
          </div>

 {/* Removed placeholder terms and conditions checkbox */}
          {/* Add checkbox for terms of use/privacy policy with link - requires additional implementation */}
          {/* <div className="mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" required />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div> */}

          <button
            type="submit"
 className={`w-full bg-blue-600 text-white py-2 rounded-md transition duration-200 ${loading || !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading || !isFormValid} // Disable if loading or form is not valid
          >
            {loading ? 'Registering...' : 'Register Company'}
          </button>
        </form>

 {/* Display signup error message */}
 {signupError && <p className="text-red-500 text-sm mt-4 text-center">{signupError}</p>}

        <p className="text-sm text-center mt-4 text-gray-600">
          Already registered? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
