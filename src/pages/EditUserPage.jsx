import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/authContext.jsx';

const validRoles = ['admin', 'Manager', 'Outreach Officer', 'Volunteer', 'Telecaller', 'CSR'];
const validStatuses = ['Active', 'Inactive', 'On Leave'];

function EditUserPage() {
  const { userId } = useParams();
  const { currentUser, companyId, userRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    city: '',
    team: '',
    status: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (!companyId || !userId) {
      setError('Company ID or User ID is missing. Cannot fetch user data.');
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const companyUserDocRef = doc(db, 'data', companyId, 'users', userId);

      const [userDocSnap, companyUserDocSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(companyUserDocRef),
      ]);

      if (!userDocSnap.exists() && !companyUserDocSnap.exists()) {
        setError('User not found.');
        return;
      }

      const userData = userDocSnap.data() || {};
      const companyUserData = companyUserDocSnap.data() || {};

      setFormData({
        name: companyUserData.name || userData.name || '',
        email: userData.email || '',
        role: companyUserData.role || userData.role || '',
        phone: companyUserData.phone || userData.phone || '',
        city: companyUserData.city || userData.city || '',
        team: companyUserData.team || userData.team || '',
        status: companyUserData.status || userData.status || '',
        notes: companyUserData.notes || userData.notes || '',
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const validateForm = () => {
    const newErrors = {};
    const { name, email, role, phone, city, status, notes } = formData;

    if (!name.trim()) newErrors.name = 'Name is required.';
    else if (name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters long.';

    if (!role) newErrors.role = 'Role is required.';
    else if (!validRoles.includes(role)) newErrors.role = 'Invalid role selected.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = 'Email address is required.';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address.';

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) newErrors.phone = 'Phone Number is required.';
    else if (!phoneRegex.test(phone)) newErrors.phone = 'Please enter a valid 10-digit Indian phone number.';

    if (city.trim() && city.trim().length < 2) newErrors.city = 'City must be at least 2 characters long.';

    if (!status) newErrors.status = 'Status is required.';
    else if (!validStatuses.includes(status)) newErrors.status = 'Invalid status selected.';

    if (notes.length > 250) newErrors.notes = 'Profile Notes cannot exceed 250 characters.';

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrors({});
    setSaveError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaveError('Please correct the errors in the form.');
      setSaveLoading(false);
      return;
    }

    try {
      const companyUserDocRef = doc(db, 'data', companyId, 'users', userId);
      const { name, role, phone, city, team, status, notes } = formData;

      await updateDoc(companyUserDocRef, {
        name,
        role,
        phone,
        city,
        team,
        status,
        notes,
      });

      console.log('User updated successfully!');
      navigate('/dashboard/admin');
    } catch (err) {
      console.error('Error updating user data:', err);
      setSaveError('Failed to update user data. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading || error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className={`text-xl ${error ? 'text-red-600' : 'text-gray-700'}`}>
          {error || 'Loading user data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Edit User Profile</h1>

      {saveError && <p className="text-red-600 text-center mb-4 text-sm">{saveError}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { id: 'name', label: 'Name', type: 'text' },
          { id: 'phone', label: 'Phone Number', type: 'tel' },
          { id: 'city', label: 'City/Location', type: 'text' },
          { id: 'team', label: 'Assigned Team', type: 'text' },
        ].map(({ id, label, type }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label}:
            </label>
            <input
              type={type}
              id={id}
              value={formData[id]}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors[id] ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
          </div>
        ))}

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            readOnly
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role:</label>
          <select
            id="role"
            value={formData.role}
            onChange={handleInputChange}
            disabled={userRole !== 'admin'}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              userRole !== 'admin' ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select Role</option>
            {validRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
          <select
            id="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          >
            <option value="">Select Status</option>
            {validStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Profile Notes:</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.notes ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          ></textarea>
          {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saveLoading}
          className="w-full py-3 px-4 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditUserPage;
