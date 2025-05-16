import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/authContext'; // Corrected import path and hook

function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const { companyId } = useauthContext();
  const { companyId: authCompanyId } = useAuth(); // Use the correctly named hook
  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        setLoading(false);
        setError(new Error('Company ID is not available.'));
        return;
      }
      try {
        const companyRef = doc(db, 'companies', authCompanyId); // Use companyId from auth context
        const snap = await getDoc(companyRef);
        if (snap.exists()) setCompanyData(snap.data());
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [authCompanyId]); // Depend on companyId from auth context

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!companyId) {
      setError(new Error('Company ID is not available for update.')); // Use error state for messaging
      return;
    }

    const newErrors = {};
    if (!companyData?.name?.trim()) newErrors.name = 'Company Name is required';
    if (!companyData?.industry?.trim()) newErrors.industry = 'Industry is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const companyDocRef = doc(db, 'companies', authCompanyId); // Use companyId from auth context
      await updateDoc(companyDocRef, {
        ...companyData,
        updatedAt: new Date(),
      });
      setSuccessMessage('Company settings updated successfully!');
      setMessage('Company info updated!');
    } catch (err) {
      console.error('Error updating company data:', err);
      setError(err);
      setMessage('Update failed. Try again.');
    } finally {
      setErrors({});
      setLoading(false);
    }
  };

  if (loading) return <div>Loading company settings...</div>;
  if (!companyData) return <p>No company data found.</p>;

  return (
    // Container for the page content. max-w-xl limits width on larger screens,
    // mx-auto centers it, and p-4 adds padding. This basic structure is mobile-friendly.
    // Consider increasing padding on larger screens if needed (e.g., sm:p-6).
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4">Company Settings</h2>

      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        {/* Form fields */}
        {['name', 'email', 'phone', 'website', 'description'].map((field) => (
          // Each form field is in a div. space-y-4 on the form ensures vertical stacking on all screen sizes.
          <div key={field}>
            {/* Labels */}
            <label className="block font-medium capitalize">{field}</label>
            {/* Input fields. w-full ensures they take full width of their container,
                making them responsive on all screen sizes. */}
            <input
              type="text"
              name={field}
              value={companyData[field] || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
            {/* Error messages */}
            {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
          </div>
        ))}

        <div>
          <label className="block font-medium capitalize">Industry</label>
          <input
            type="text"
            name="industry"
            value={companyData?.industry || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.industry && <p className="text-red-500 text-sm">{errors.industry}</p>}
        </div>

        <button
          // Button styling is applied directly. Ensure padding (py, px) and text size
          // are appropriate for touch targets on mobile. The current classes are generally
          // suitable, but can be adjusted responsively if necessary (e.g., sm:text-lg).
          type="submit"
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default CompanySettingsPage;
