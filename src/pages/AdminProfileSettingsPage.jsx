import React, { useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Assuming you have initialized Firebase and exported db
import { useAuth } from '../contexts/authContext'; // Corrected import path

function AdminProfileSettingsPage() { // Review for mobile responsiveness, especially form layout.
  const { currentUser } = useAuth(); // Use useAuth hook
  // For now, we'll use basic data from auth context and a placeholder for phone number
  const [name, setName] = React.useState(currentUser?.displayName || ''); // Initial state using currentUser from useAuth
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (currentUser?.uid) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setName(userData.name || '');
            setPhoneNumber(userData.contactNumber || '');
          } else {
            setError('User profile not found.');
          }
        } catch (err) {
          setError('Failed to fetch profile: ' + err.message);
          console.error('Error fetching admin profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAdminProfile();
  }, [currentUser]); // Re-run effect if currentUser changes

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    // Add phone number validation here if you have a specific format

    setErrors(newErrors);

    if (!currentUser?.uid) return; // Ensure user is logged in
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: name,
        contactNumber: phoneNumber,
      });
      alert('Profile updated successfully!'); // Success message
    } catch (err) {
      alert('Failed to update profile: ' + err.message); // Error message
      console.error('Error updating admin profile:', err);
    }
  };

  return (
    // Use Tailwind padding classes for responsiveness
    <div className="p-4 sm:p-6 lg:p-8"> {/* Added responsive padding */}\n      {/* Adjust heading size for smaller screens if needed */}
      <h1 className="text-2xl font-bold mb-6">Admin Profile Settings</h1> {/* Styled heading */}

      {/* Use a container for the form with potential styling */}
      <div className="bg-white rounded-lg shadow-md p-6"> {/* Added card styling */}
      <form onSubmit={handleSaveProfile}>
        {/* Consider styling for loading and error messages */}
        {loading && <p className="text-center text-gray-600">Loading profile...</p>} {/* Styled loading */}
        {error && <p className="text-red-500 mb-4">{error}</p>} {/* Styled error */}
        {!loading && !error && (
          // Use flexbox or grid with flex-col for mobile stacking
          <div className="space-y-4"> {/* Added vertical spacing between form groups */}\n            <div>\n              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label> {/* Styled label */}\n              {/* Ensure input takes full width on mobile */}
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : ''}`} // Added Tailwind form styling and error border
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>} {/* Styled error message */}
            </div>
            {/* Add appropriate spacing between form fields */}
            <div> {/* Use div for form group spacing */}
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Contact Number:</label> {/* Styled label */}\n              {/* Ensure input takes full width on mobile */}
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter contact number"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" // Added Tailwind form styling
              />
            </div>
          </div>
        )}

        {/* Email display - ensure it wraps if long on mobile */}
        <div className="mt-4"> {/* Added top margin */}
            <label className="block text-sm font-medium text-gray-700">Email:</label> {/* Styled label */}\n            {/* Use break-words if necessary for long emails */}
            <p>{currentUser?.email}</p> {/* Display email from auth context */}
        </div>

        {/* Style the submit button */}
        <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Save Profile</button> {/* Added button styling and top margin */}
      </form>
      </div> {/* End of card styling div */}

      {/* Add sections for password change or other settings if needed */}
    </div>
  );
}

export default AdminProfileSettingsPage;
