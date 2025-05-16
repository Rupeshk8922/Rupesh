import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useauthContext } from '../../../contexts/authContext'; // Assuming useauthContext is used

function AdminProfileSettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const { user, companyId } = useauthContext(); // Assuming useauthContext provides user and companyId and is now named useAuth
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user || !companyId) {
        return;
      }

      try {
        const adminDocRef = doc(db, 'companies', companyId, 'users', user.uid);
        const docSnap = await getDoc(adminDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setEmail(data.email || '');
          setRole(data.role || ''); // Assuming role is stored
        } else {
          setError('Admin profile not found.');
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('Failed to load profile.');
      } finally {
      }
    };

    fetchAdminProfile();
  }, [user, companyId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user || !companyId) return;

    setIsUpdating(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const adminDocRef = doc(db, 'companies', companyId, 'users', user.uid);
      await updateDoc(adminDocRef, {
        name: name,
        // Note: Email and Role are typically not changed via a user profile form
        // If they were, you'd add them here. For now, assuming only name can be updated.
      });
      setUpdateSuccess(true);
      // Optionally refetch profile data to show the updated name
      // fetchAdminProfile();
    } catch (err) {
      console.error('Error updating admin profile:', err);
      setError('Failed to update profile.');
      setUpdateSuccess(false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isUpdating}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            // Email is often read-only, remove onChange if not intended to be editable
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            disabled
          />
        </div>
        {/* Assuming role is displayed but not editable */}
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role:</label>
          <input
            type="text"
            id="role"
            value={role}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            disabled
          />
        </div>
        {updateSuccess && <p className="text-green-500 mb-4">Profile updated successfully!</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}

export default AdminProfileSettingsPage;