import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/authContext.jsx';

function AdminProfileSettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { user, companyId } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not admin (optional - adjust role check as per your roles)
  useEffect(() => {
    if (role && role !== 'admin') {
      navigate('/not-authorized'); // or any fallback route
    }
  }, [role, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user || !companyId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const adminDocRef = doc(db, 'companies', companyId, 'users', user.uid);
        const docSnap = await getDoc(adminDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setEmail(data.email || '');
          setRole(data.role || '');
        } else {
          setError('Admin profile not found.');
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, [user, companyId]);

  // Handle update with validation and error clearing
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user || !companyId) return;

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const adminDocRef = doc(db, 'companies', companyId, 'users', user.uid);
      await updateDoc(adminDocRef, { name: name.trim() });
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Error updating admin profile:', err);
      setError('Failed to update profile.');
      setUpdateSuccess(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear error on input change for better UX
  const onNameChange = (e) => {
    setName(e.target.value);
    if (error) setError(null);
    if (updateSuccess) setUpdateSuccess(false);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-blue-600">Loading profile...</div>;
  }

  if (error && !updateSuccess) {
    // Show error full page only if it’s fetching error, not update error in form
    return <div className="p-4 text-red-600 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-semibold mb-6 text-gray-900">Profile Settings</h2>
      <form onSubmit={handleUpdateProfile} noValidate>
        <div className="mb-5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={onNameChange}
            disabled={isUpdating}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            aria-describedby="name-error"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="block w-full px-3 py-2 bg-gray-100 cursor-not-allowed rounded-md border border-gray-300 sm:text-sm"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            disabled
            className="block w-full px-3 py-2 bg-gray-100 cursor-not-allowed rounded-md border border-gray-300 sm:text-sm"
          />
        </div>

        {/* Accessible live region for feedback */}
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 min-h-[1.5em] text-center text-sm"
        >
          {updateSuccess && <p className="text-green-600">Profile updated successfully!</p>}
          {error && !isLoading && !updateSuccess && (
            <p id="name-error" className="text-red-600">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                     disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}

export default AdminProfileSettingsPage;
