import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config.jsx'; // Firebase Firestore instance
import { useAuth } from '@/contexts/authContext.jsx'; // Custom auth context hook
function AdminProfileSettingsPage() { // Fixed incorrect function name
  const { currentUser } = useAuth();

  const [name, setName] = useState(currentUser?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setName(userData.name || '');
          setPhoneNumber(userData.contactNumber || '');
          setError(null);
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        setError('Failed to fetch profile: ' + err.message);
        console.error('Error fetching admin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!currentUser?.uid) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: name.trim(),
        contactNumber: phoneNumber.trim(),
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
      console.error('Error updating admin profile:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Profile Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSaveProfile}>
          {loading && <p className="text-center text-gray-600">Loading profile...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {!loading && !error && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Contact Number:
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter contact number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <p className="break-words">{currentUser?.email}</p>
          </div>

          <button
            type="submit"
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProfileSettingsPage;
