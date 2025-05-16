import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/authContext.jsx'; // Assuming useAuth provides user and companyId

function AdminProfileSettingsPage() { // <--- The function definition starts here
  // --- State Variables ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added for initial loading state

  // --- Auth Context ---
  const { user, companyId } = useAuth(); // Assuming useAuth provides user and companyId

  // --- Effect Hook for Fetching Profile Data ---
  useEffect(() => {
    const fetchAdminProfile = async () => {
      // Only proceed if user and companyId are available
      if (!user || !companyId) {
        setIsLoading(false); // Stop loading if no user/companyId
        return;
      }

      setIsLoading(true); // Start loading when fetch begins
      setError(null); // Clear previous errors

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
        setIsLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchAdminProfile();
  }, [user, companyId]); // Dependencies: re-run if user or companyId changes

  // --- Handle Profile Update ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!user || !companyId) return; // Do nothing if auth data is missing

    setIsUpdating(true); // Indicate update is in progress
    setError(null); // Clear previous errors
    setUpdateSuccess(false); // Reset success message

    try {
      const adminDocRef = doc(db, 'companies', companyId, 'users', user.uid);
      await updateDoc(adminDocRef, {
        name: name,
        // Note: Email and Role are typically not changed via a user profile form
        // If they were, you'd add them here. For now, assuming only name can be updated.
      });
      setUpdateSuccess(true); // Set success flag
      // Optionally, you might want to refetch the profile here if other fields could have changed
      // but for just updating 'name', it's often not strictly necessary as 'name' is already in state.
    } catch (err) {
      console.error('Error updating admin profile:', err);
      setError('Failed to update profile.');
      setUpdateSuccess(false); // Ensure success is false on error
    } finally {
      setIsUpdating(false); // Stop indicating update is in progress
    }
  };

  // --- Conditional Rendering for Loading/Error States ---
  if (isLoading) {
    return <div className="p-4 text-center text-blue-600">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  }

  // --- Main Component Render (JSX) ---
  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Settings</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isUpdating} // Disable input during update
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled // Email is read-only
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
          />
        </div>
        <div className="mb-6"> {/* Added more bottom margin for clarity */}
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role:</label>
          <input
            type="text"
            id="role"
            value={role}
            disabled // Role is read-only
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
          />
        </div>

        {/* --- Feedback Messages --- */}
        {updateSuccess && <p className="text-green-600 text-sm mb-4">Profile updated successfully!</p>}
        {error && <p className="text-red-600 text-sm mb-4">Error: {error}</p>} {/* Display update errors too */}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          disabled={isUpdating} // Disable button during update
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
} // <--- The function definition ends here

export default AdminProfileSettingsPage;