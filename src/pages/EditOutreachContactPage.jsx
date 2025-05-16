import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
// import { useauthContext } from '../contexts/authContext'; // This import was unused and can be removed
import { useAuth } from '../contexts/authContext';

function EditOutreachContactPage() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { user, companyId } = useAuth(); // Use useAuth hook
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    title: '',
    tags: '',
    assignedTo: '',
  });

  const [email, setEmail] = useState(''); // State for email as it's not directly editable
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
            name: data.name || '', // Assuming name is editable
            phone: data.phone || '',
            company: data.company || '',
            title: data.title || '',
            tags: data.tags?.join(', ') || '',
            assignedTo: data.assignedTo || '',
          });
          setEmail(data.email || ''); // Set email separately
        } else {
          setError("Contact not found.");
        }
      } catch (err) {
        setError("Error loading contact. Please try again.");
        console.error(err);
      }
      setLoading(false);
    };

    /*
     * TODO: Review form layout for mobile responsiveness.
     * Currently, each field is a block element, which is good for stacking on small screens.
     * Ensure sufficient padding and margins are used (Tailwind's default 'space-y-4' helps).
     * Check if any specific fields might need different handling on smaller screens.
     * Consider using Tailwind responsive prefixes like `sm:` or `md:` if layout changes are desired at breakpoints.
     */
    fetchContactData();
  }, [companyId, contactId, user]); // Add user to dependencies if access is role-based

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
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      await updateDoc(contactRef, {
        ...formData,
        tags: tagsArray,
        assignedTo: formData.assignedTo || null,
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/*
           * TODO: Review input field styling for mobile.
           * The `w-full` class ensures the inputs take full width, which is good for stacking.
           * Ensure padding (`p-2`) and font size (`sm:text-sm`) are appropriate for mobile input.
           */}
          {['name', 'email', 'phone', 'company', 'title'].map((field) => (
            <div key={field} className={field === 'email' ? 'opacity-50 cursor-not-allowed' : ''}> {/* Dim email field */}
              <label className="block text-sm font-medium capitalize">{field}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={field === 'email'} // Disable email field
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Assigned To (User UID)</label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/*
           * TODO: Review button responsiveness.
           * Ensure the button scales correctly and is easy to tap on mobile.
           * Tailwind's default button styling with padding (`py-2 px-4`) is usually sufficient.
           */}
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
