import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData.jsx';
import { useAuth } from '../contexts/authContext';
function CompanySettingsPage() {
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false); // State for update loading
 const [error, setError] = useState(null);
  const { companyId: authCompanyId } = useAuth(); // Use the correctly named hook
  const { companyData, loading, refetchCompanyData } = useFetchCompanyData(authCompanyId);
  const [localCompanyData, setLocalCompanyData] = useState(null);

  useEffect(() => {
    if (companyData) {
      setLocalCompanyData(companyData);
    }
  }, [companyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalCompanyData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    if (!authCompanyId || !localCompanyData) {
      // Handle case where companyId or localCompanyData is not available
      return;
    }

    const newErrors = {};
    if (!companyData?.name?.trim()) newErrors.name = 'Company Name is required';
    if (!companyData?.industry?.trim()) newErrors.industry = 'Industry is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsUpdating(true);
 setMessage(''); // Clear previous messages
 setSuccessMessage('');
    try {
      const companyDocRef = doc(db, 'companies', authCompanyId); // Use companyId from auth context
      await updateDoc(companyDocRef, {
        ...localCompanyData,
 updatedAt: new Date(),
      });
      setSuccessMessage('Company settings updated successfully!');
 refetchCompanyData(); // Re-fetch data to ensure UI is in sync
 } catch (err) {
 console.error('Error updating company data:', err);
      setError(err);
      setMessage('Update failed. Try again.');
    } finally {
      setErrors({});
      setIsUpdating(false);
    }
  };

  if (loading) return <div>Loading company settings...</div>;
  if (!companyData) return <p>No company data found.</p>;

  return (
    // Container for the page content. max-w-xl limits width on larger screens,
    // mx-auto centers it, and p-4 adds padding. This basic structure is mobile-friendly.
    // Consider increasing padding on larger screens if needed (e.g., sm:p-6).
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Settings</h2>

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
              value={localCompanyData?.[field] || ''}
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
            value={localCompanyData?.industry || ''}
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
          disabled={isUpdating || loading || !localCompanyData} // Disable while loading or updating
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default CompanySettingsPage;
