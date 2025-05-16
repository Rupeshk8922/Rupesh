import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Firestore config

import { useAuth } from '../contexts/authContext'; // Corrected hook name and path

function EditUserPage() {
  const { userId } = useParams(); // Get userId from URL
  const { currentUser, companyId, userRole } = useauthContext(); // Auth context
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [team, setTeam] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null); // State for general loading/error messages
  const [saveLoading, setSaveLoading] = useState(false); // State for save operation specific loading
  const [saveError, setSaveError] = useState(null); // State for save operation specific error messages

  // Define valid roles and statuses for select dropdowns
  const validRoles = ['admin', 'Manager', 'Outreach Officer', 'Volunteer', 'Telecaller', 'CSR'];
  const validStatuses = ['Active', 'Inactive', 'On Leave'];

  useEffect(() => {
    const fetchUserData = async () => { // Added fetchUserData function inside useEffect
      if (!companyId || !userId) {
        setError('Company ID or User ID is missing. Cannot fetch user data.');
        setLoading(false);
        return;
      }

      try {
        // Fetch user data from the 'users' collection (assuming this holds general user info)
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        // Fetch user data specific to the company from 'data/{companyId}/users'
        const companyUserDocRef = doc(db, 'data', companyId, 'users', userId);
        const companyUserDocSnap = await getDoc(companyUserDocRef);

        if (userDocSnap.exists() || companyUserDocSnap.exists()) {
          const userData = userDocSnap.exists() ? userDocSnap.data() : {};
          const companyUserData = companyUserDocSnap.exists() ? companyUserDocSnap.data() : {};

          // Prioritize data from 'companyUserData' if available, otherwise use 'userData'
          setName(companyUserData.name || userData.name || '');
          setEmail(userData.email || ''); // Email typically unique to the user, not company-specific
          setRole(companyUserData.role || userData.role || '');
          setPhone(companyUserData.phone || userData.phone || '');
          setCity(companyUserData.city || userData.city || '');
          setTeam(companyUserData.team || userData.team || '');
          setStatus(companyUserData.status || userData.status || '');
          setNotes(companyUserData.notes || userData.notes || '');
        } else {
          setError('User not found.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [companyId, userId]); // Depend on companyId and userId

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaveLoading(true);
    setErrors({}); // Clear previous errors
    setSaveError(null); // Clear previous save errors

    const newErrors = {};

    // Validate Name
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long.';
    }

    // Validate Role
    if (!role) {
      newErrors.role = 'Role is required.';
    } else if (!validRoles.includes(role)) {
      newErrors.role = 'Invalid role selected.';
    }

    // Validate Email (Read-only, but still good to have a check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Validate Phone Number (Required, 10 digits, Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number.';
    }

    // Validate City/Location
    if (city.trim() && city.trim().length < 2) {
      newErrors.city = 'City/Location must be at least 2 characters long.';
    }

    // Validate Status
    if (!status) {
      newErrors.status = 'Status is required.';
    } else if (!validStatuses.includes(status)) {
      newErrors.status = 'Invalid status selected.';
    }

    // Validate Profile Notes
    if (notes.length > 250) {
      newErrors.notes = 'Profile Notes cannot exceed 250 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaveError('Please correct the errors in the form.');
      setSaveLoading(false);
      return; // Stop form submission
    }

    try {
      // Update the company-specific user document
      const companyUserDocRef = doc(db, 'data', companyId, 'users', userId);
      await updateDoc(companyUserDocRef, {
        name,
        role,
        phone,
        city,
        team,
        status,
        notes,
      });

      // You might also want to update the main 'users' collection if data is duplicated
      // const userDocRef = doc(db, 'users', userId);
      // await updateDoc(userDocRef, { name, role, phone, city, status, notes }); // Email should not be updated here as it's read-only

      console.log('User updated successfully!');
      // Navigate back to the admin dashboard or user list
      navigate('/dashboard/admin'); // Or wherever your user list is located
    } catch (err) {
      console.error('Error updating user data:', err);
      setSaveError('Failed to update user data. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Display loading/error messages for initial data fetch
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Edit User Profile</h1>

      {saveError && <p className="text-red-600 text-center mb-4 text-sm">{saveError}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            readOnly
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>} {/* Added error for email */}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            // Only 'admin' can change roles
            disabled={userRole !== 'admin'}
            required
            className={`mt-1 block w-full px-3 py-2 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${userRole !== 'admin' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Role</option>
            {validRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* City/Location */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City/Location:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        {/* Assigned Team */}
        <div>
          <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">Assigned Team:</label>
          <input
            type="text"
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className={`mt-1 block w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          >
            <option value="">Select Status</option>
            {validStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
        </div>

        {/* Profile Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Profile Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
            className={`mt-1 block w-full px-3 py-2 border ${errors.notes ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          ></textarea>
          {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saveLoading}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditUserPage;