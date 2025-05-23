import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/authContext';

function EditOutreachContactPage() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { companyId } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    tags: '',
    assignedTo: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchContactData = async () => {
      if (!companyId || !contactId) {
        setError("Missing company or contact ID.");
        setLoading(false);
        return;
      }

      try {
        const contactRef = doc(db, 'companies', companyId, 'outreachContacts', contactId);
        const docSnap = await getDoc(contactRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            title: data.title || '',
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            assignedTo: data.assignedTo || '',
          });
        } else {
          setError("Contact not found.");
        }
      } catch (err) {
        setError("Error loading contact. Please try again.");
        console.error(err);
      }
      setLoading(false);
    };

    fetchContactData();
  }, [companyId, contactId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!companyId || !contactId) {
      setError("Company or Contact ID missing.");
      setSaving(false);
      return;
    }

    try {
      const contactRef = doc(db, 'companies', companyId, 'outreachContacts', contactId);
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      await updateDoc(contactRef, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        title: formData.title.trim(),
        tags: tagsArray,
        assignedTo: formData.assignedTo.trim() || null,
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/outreach/contacts'), 1000);
    } catch (err) {
      setError("Failed to save changes. Try again.");
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Contact</h2>

      {loading && <p>Loading contact data...</p>}
      {error && <div className="text-red-600 font-medium mb-4">{error}</div>}
      {success && <div className="text-green-600 font-medium mb-4">Changes saved! Redirecting...</div>}

      {!loading && !error && (
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={saving}>
          {['name', 'email', 'phone', 'company', 'title'].map((field) => (
            <div key={field} className={field === 'email' ? 'opacity-50 cursor-not-allowed' : ''}>
              <label htmlFor={field} className="block text-sm font-medium capitalize">
                {field}
              </label>
              <input
                id={field}
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={field === 'email'}
              />
            </div>
          ))}

          <div>
            <label htmlFor="tags" className="block text-sm font-medium">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium">Assigned To (User UID)</label>
            <input
              id="assignedTo"
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}

export default EditOutreachContactPage;
