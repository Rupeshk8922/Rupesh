import { useEffect, useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFetchCompanyData } from "../../../hooks/useFetchCompanyData";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../firebase/config";
function CompanySettingsPage() {
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const { companyId: authCompanyId } = useAuth();
  const { companyData, loading, refetchCompanyData } = useFetchCompanyData(authCompanyId); // Hook path corrected
  const [localCompanyData, setLocalCompanyData] = useState(null);

  useEffect(() => {
    if (companyData) {
      setLocalCompanyData(companyData);
    }
  }, [companyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalCompanyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!authCompanyId || !localCompanyData) return;

    const newErrors = {};
    if (!localCompanyData.name?.trim()) newErrors.name = 'Company Name is required';
    if (!localCompanyData.industry?.trim()) newErrors.industry = 'Industry is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsUpdating(true);
    setMessage('');
    setSuccessMessage('');
    setError(null);

    try {
      const companyDocRef = doc(db, 'companies', authCompanyId);
      await updateDoc(companyDocRef, {
        ...localCompanyData,
        updatedAt: Timestamp.now(),
      });

      setSuccessMessage('Company settings updated successfully!');
      refetchCompanyData();
    } catch (err) {
      console.error('Error updating company data:', err);
      setError(err);
      setMessage('Update failed. Try again.');
    } finally {
      setIsUpdating(false);
      setErrors({});
    }
  };

  if (loading) return <div>Loading company settings...</div>;
  if (!companyData) return <p>No company data found.</p>;

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Settings</h2>

      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      {successMessage && <p className="mb-4 text-green-600">{successMessage}</p>}
      {error && (
        <p className="mb-4 text-red-600">
          {error?.message?.includes('permission-denied')
            ? 'You don’t have permission to update this data.'
            : error?.message || 'Something went wrong.'}
        </p>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        {['name', 'email', 'phone', 'website', 'description'].map((field) => (
          <div key={field}>
            <label className="block font-medium capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={localCompanyData?.[field] || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
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
          type="submit"
          disabled={isUpdating || loading || !localCompanyData}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default CompanySettingsPage;
