import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../firebase/config';
import { useAuth } from '../contexts/authContext';

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
  const { user } = useAuth(); // Assuming useAuth provides user which contains companyId

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

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
      setFormError("Company ID not available. Cannot add user.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        name: name.trim(),
        email,
        role: role.toLowerCase(), // Ensure role is stored in lowercase
        companyId,
        createdAt: serverTimestamp(),
      });

      setSuccessMessage('User added successfully! Redirecting...');
      setLoading(false);
    } catch (err) {
      console.error("Error adding user:", err);
      setLoading(false);
      let userFriendlyMessage = "Failed to add user.";
      switch (err.code) {
        case 'auth/email-already-in-use':
          userFriendlyMessage = "The email address is already in use by another account.";
          break;
        case 'auth/weak-password':
          userFriendlyMessage = "The password is too weak. Please choose a stronger password.";
          break;
        case 'auth/invalid-email':
          userFriendlyMessage = "The email address is invalid.";
          break;
      }
      setFormError(userFriendlyMessage);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Add New User</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {formError && <p className="text-red-500 mb-4">{formError}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
 // Classname for styling and error highlighting
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.password}</p>}
          </div>
          <div className="mb-6">
            <label>Role:</label>
            <select
              value={role}
              onChange={handleRoleChange}
              required
              disabled={loading}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.role ? 'border-red-500' : ''}`}
            >
              <option value="">Select Role</option>
              {availableRoles.map((availableRole) => (
                <option key={availableRole} value={availableRole}>
                  {availableRole.charAt(0).toUpperCase() + availableRole.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.role}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full sm:w-auto"
          >
            {loading ? 'Adding User...' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUserPage;
