import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../../../firebase';
import { useAuth } from '../../../../../contexts/authContext';
import { Navigate } from 'react-router-dom';

const allowedRoles = ['admin', 'csr', 'project-manager'];

const getDateRanges = () => {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
    (now.getMonth() + 1) % 12,
    1
  );

  return {
    startOfToday: Timestamp.fromDate(startOfToday),
    startOfTomorrow: Timestamp.fromDate(startOfTomorrow),
    startOfMonth: Timestamp.fromDate(startOfMonth),
    startOfNextMonth: Timestamp.fromDate(startOfNextMonth),
  };
};

function DCRPage() {
  const { user, userRole, authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    id: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [dailyCount, setDailyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);

  // Redirect if unauthorized
  if (authLoading) return <div className="p-4">Checking permissions...</div>;
  if (!user || !allowedRoles.includes(userRole)) return <Navigate to="/access-denied" />;

  const fetchCounts = async () => {
    setCountsLoading(true);
    try {
      const { startOfToday, startOfTomorrow, startOfMonth, startOfNextMonth } = getDateRanges();

      const dailyQuery = query(
        collection(db, 'dcrEntries'),
        where('createdAt', '>=', startOfToday),
        where('createdAt', '<', startOfTomorrow)
      );
      const dailySnapshot = await getDocs(dailyQuery);

      const monthlyQuery = query(
        collection(db, 'dcrEntries'),
        where('createdAt', '>=', startOfMonth),
        where('createdAt', '<', startOfNextMonth)
      );
      const monthlySnapshot = await getDocs(monthlyQuery);

      setDailyCount(dailySnapshot.size);
      setMonthlyCount(monthlySnapshot.size);
    } catch (err) {
      console.error('Error fetching counts:', err);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\+?\d{7,15}$/.test(formData.phone.trim()))
      errors.phone = 'Enter valid phone number';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Enter valid email address';
    if (!formData.id.trim()) errors.id = 'ID is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addDoc(collection(db, 'dcrEntries'), {
        ...formData,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', id: '' });
      fetchCounts();
    } catch (err) {
      console.error('Error saving DCR entry:', err);
      setError('Failed to save entry, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">Daily Contact Report (DCR)</h1>

      <div className="mb-6 flex justify-between bg-gray-100 p-4 rounded">
        <div>
          <h2 className="font-semibold">Today's Count</h2>
          {countsLoading ? <p>Loading...</p> : <p>{dailyCount}</p>}
        </div>
        <div>
          <h2 className="font-semibold">This Month's Count</h2>
          {countsLoading ? <p>Loading...</p> : <p>{monthlyCount}</p>}
        </div>
      </div>

      {success && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-3 bg-green-100 text-green-700 rounded"
        >
          Entry saved successfully!
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-3 bg-red-100 text-red-700 rounded"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="name" className="block font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            aria-invalid={formErrors.name ? 'true' : 'false'}
            className="w-full border rounded p-2"
          />
          {formErrors.name && (
            <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            placeholder="+919876543210"
            aria-invalid={formErrors.phone ? 'true' : 'false'}
            className="w-full border rounded p-2"
          />
          {formErrors.phone && (
            <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block font-medium">
            Email (optional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="example@mail.com"
            aria-invalid={formErrors.email ? 'true' : 'false'}
            className="w-full border rounded p-2"
          />
          {formErrors.email && (
            <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="id" className="block font-medium">
            ID <span className="text-red-500">*</span>
          </label>
          <input
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={loading}
            aria-invalid={formErrors.id ? 'true' : 'false'}
            className="w-full border rounded p-2"
          />
          {formErrors.id && (
            <p className="text-sm text-red-600 mt-1">{formErrors.id}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold p-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
}

export default DCRPage;
