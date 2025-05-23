import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';import { app, auth, db } from '@/firebase/config.jsx';
import { useAuth } from '../contexts/authContext.jsx';

function AddUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth(); // Logged-in user context, provides companyId



  const availableRoles = ['admin', 'manager', 'outreach', 'volunteer', 'telecaller', 'csr'];

  useEffect(() => {
    if (successMessage) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('');

      const timer = setTimeout(() => {
        navigate('/dashboard/admin/users');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleRoleChange = (event) => {
    setRole(event.target.value.toLowerCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setFormError(null);
    setSuccessMessage('');
    setLoading(true);

    let newErrors = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format.';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    }

    if (!role) {
      newErrors.role = 'Role is required.';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    if (!user || !user.companyId) {
      setFormError('Company ID not available. Cannot add user.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: firebaseUser.uid,
        name: name.trim(),
        email,
        role: role.toLowerCase(),
        companyId: user.companyId,
        createdAt: serverTimestamp(),
      });

      setSuccessMessage('User added successfully! Redirecting...');
      setLoading(false);
    } catch (err) {
      console.error('Error adding user:', err);
      setLoading(false);

      let userFriendlyMessage = 'Failed to add user.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          userFriendlyMessage = 'The email address is already in use by another account.';
          break;
        case 'auth/weak-password':
          userFriendlyMessage = 'The password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          userFriendlyMessage = 'The email address is invalid.';
          break;
      }
      setFormError(userFriendlyMessage);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Add New User</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {formError && <p className="text-red-500 mb-4">{formError}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 font-medium">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.name ? 'border-red-500' : ''
              }`}
              required
              autoComplete="name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email ? 'border-red-500' : ''
              }`}
              required
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.password ? 'border-red-500' : ''
              }`}
              required
              autoComplete="new-password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block mb-1 font-medium">Role:</label>
            <select
              id="role"
              value={role}
              onChange={handleRoleChange}
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.role ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Select Role</option>
              {availableRoles.map((availableRole) => (
                <option key={availableRole} value={availableRole}>
                  {availableRole.charAt(0).toUpperCase() + availableRole.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full sm:w-auto flex justify-center items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Adding User...
              </>
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUserPage;
