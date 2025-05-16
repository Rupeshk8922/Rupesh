import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Adjust path as needed

import { useAuth } from '../contexts/authContext.jsx'; // Corrected import and hook name

function EditLeadPage() {
  const { leadId } = useParams(); // Get leadId from URL parameters
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    source: '',
    status: '',
    assignedTo: '',
    notes: '' // Assuming notes are also editable
  });
 const { user, companyId, userRole } = useAuth(); // Corrected hook usage and destructuring

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [errors, setErrors] = useState({});
  // Validation error states
  const [nameError, setNameError] = useState('');
  const [contactError, setContactError] = useState('');
  const [sourceError, setSourceError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [assignedToError, setAssignedToError] = useState('');
  const [notesError, setNotesError] = useState('');

  // Validation functions (similar to AddLeadForm.jsx)
  const validateName = (name) => {
    if (!name.trim()) return 'Lead name is required.';
    if (name.trim().length < 3) return 'Lead name must be at least 3 characters.';
    if (name.trim().length > 100) return 'Lead name must be under 100 characters.';
    return '';
  };

  const validateContact = (contact) => {
    if (!contact.trim()) return 'Contact information is required.';
    // Basic regex for email or phone number (adjust as needed for more strict validation)
    const contactRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^[0-9]{10,}$/; // Basic email or 10+ digits
    if (!contactRegex.test(contact.trim())) return 'Please enter a valid email or phone number.';
    return '';
  };

  const validateStatus = (status) => {
 if (!status || status.trim() === '') return 'Status is required.';
    const validStatuses = ['New', 'In Progress', 'Converted', 'Closed']; // Match options in select
    if (!validStatuses.includes(status)) return 'Invalid status selected.';
    return '';
  };

  const validateSource = (source) => {
    if (source.trim().length > 50) return 'Source must be under 50 characters.';
    return '';
  };

  const validateAssignedTo = (assignedTo) => {
    if (assignedTo.trim().length > 50) return 'Assigned To must be under 50 characters.';
    return '';
  };

  const validateNotes = (notes) => {
    if (notes.trim().length > 300) return 'Notes must be under 300 characters.';
    return '';
  };

  // Combine all validations
  const validateForm = (data) => {
      return {
          nameError: validateName(data.name),
          contactError: validateContact(data.contact),
          statusError: validateStatus(data.status),
          sourceError: validateSource(data.source),
          assignedToError: validateAssignedTo(data.assignedTo),
          notesError: validateNotes(data.notes)
      };
  };

  // Basic role check (adjust role as needed for lead editing permissions)

  // useEffect to fetch lead data will go here
  useEffect(() => {
   const fetchLeadData = async () => {
 if (!companyId || !leadId) {
        setLoading(false);
        return;
      }

      try {
        const leadDocRef = doc(db, 'data', companyId, 'leads', leadId);
        const leadDocSnap = await getDoc(leadDocRef);

        if (leadDocSnap.exists()) {
          const leadData = leadDocSnap.data();
          setFormData({
            name: leadData.name || '',
            contact: leadData.contact || '',
            source: leadData.source || '',
            status: leadData.status || '',
            assignedTo: leadData.assignedTo || '',
            notes: leadData.notes || ''
          });
        } else {
          setError('Lead not found.');
        }
      } catch (err) {
        console.error('Error fetching lead data:', err);
        setError('Failed to fetch lead data.');
      } finally {
        setLoading(false);
      }
    };

 if (companyId && leadId) fetchLeadData(); // Only fetch if companyId and leadId are available
  }, [leadId, companyId]); // Dependencies
  if (userRole !== 'admin' && userRole !== 'Manager' && userRole !== 'Outreach Officer') {
     return <div style={{ padding: '2rem', color: 'red' }}>You do not have permission to edit leads.</div>;
  }

  // handleChange function will go here
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Perform validation and update error state based on the field name
    switch (name) {
        case 'name':
            setNameError(validateName(value));
            break;
        case 'contact':
            setContactError(validateContact(value));
            break;
        case 'status':
            setStatusError(validateStatus(value));
            break;
        case 'source':
            setSourceError(validateSource(value));
            break;
        case 'assignedTo':
            setAssignedToError(validateAssignedTo(value));
            break;
        case 'notes':
            setNotesError(validateNotes(value));
            break;
        default:
            break;
    }


  };

  // handleSubmit function will go here
  const handleSubmit = async (e) => {
      e.preventDefault();
      // TODO: Mobile Responsiveness - Ensure button disabled state is clear on touch devices
      setSaveLoading(true);
      setErrors({}); // Reset errors state
      setSaveError(null); // Reset save error

      // Perform validation for all fields before attempting to save
      const newErrors = validateForm(formData);
      setErrors(newErrors);

      // Check if there are any validation errors
      if (Object.values(newErrors).some(error => error !== '')) {
          setSaveLoading(false);
          setSaveError("Please fix the errors above.");
          return;
      }

      try {
          // Construct Firestore document reference
          const leadDocRef = doc(db, 'data', companyId, 'leads', leadId);

          // Update the lead document in Firestore
          await updateDoc(leadDocRef, formData);

          console.log('Lead updated successfully');
    navigate(`/leads/${leadId}`); // Navigate back to the lead details page
      } catch (err) {
          console.error('Error updating lead data:', err);
          setSaveError('Failed to update lead data.');
      } finally {
          setSaveLoading(false);
      }
  };
  return (
    // TODO: Mobile Responsiveness - Adjust padding based on screen size (e.g., p-4 sm:p-6).
    // The max-w-xl and mx-auto help center the form on larger screens.
    <div className="p-4 bg-white rounded shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Lead</h2>
      {/* TODO: Mobile Responsiveness - Ensure error messages are easily visible and readable on smaller screens. */}
      {saveError && <p style={{ color: 'red' }}>{saveError}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input fields will go here */}
        <div>
          <label htmlFor="name" className="block font-medium">Lead Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            // TODO: Mobile Responsiveness - w-full class ensures the input takes the full width of its container on small screens, which is good.
          />
          {nameError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{nameError}</div>}
        </div>

        <div>
          <label htmlFor="contact" className="block font-medium">Contact:</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            // TODO: Mobile Responsiveness - w-full class ensures the input takes the full width.
          />
          {contactError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{contactError}</div>}
        </div>

        <div>
          <label htmlFor="status" className="block font-medium">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
           disabled={userRole && !['admin', 'CSR', 'Outreach Officer'].includes(userRole)}
            className="w-full border px-3 py-2 rounded"
            // TODO: Mobile Responsiveness - w-full class ensures the select takes the full width.
          >
            <option value="">Select Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>
          {/* {statusError && <div style={{ color: 'red' }}>{statusError}</div>} */}
          {statusError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{statusError}</div>}
        </div>

        <div>
          <label htmlFor="source" className="block font-medium">Source:</label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            // TODO: Mobile Responsiveness - w-full class ensures the input takes the full width.
          />
          <label htmlFor="source" className="block font-medium">Source:</label>
          {sourceError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{sourceError}</div>}
        </div>

        {/* TODO: Mobile Responsiveness - Adjust button size and spacing. */}

        <button
          type="submit" // Add disabled logic below
          disabled={ // Start of JSX expression
            saveLoading || // Disable while saving
            Object.values(errors).some(error => error !== '') || // Disable if any validation errors exist
            !formData.name.trim() || // Disable if required fields are empty
            !formData.contact.trim() ||
            !formData.status
          } // End of JSX expression
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      {/* Add remaining input fields and error displays after implementing validation and handleChange */}
      {/* Assigned To */}
      <div>
          <label htmlFor="assignedTo" className="block font-medium">Assigned To:</label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            // TODO: Mobile Responsiveness - w-full class ensures the input takes the full width.
          />
          {assignedToError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{assignedToError}</div>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block font-medium">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            // TODO: Mobile Responsiveness - w-full class ensures the textarea takes the full width.
            rows="4"
          ></textarea>
          {notesError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{notesError}</div>}
        </div>

        {/* Conditional rendering for loading and error */}
        {loading && (
            <div className="text-center text-gray-500">Loading lead data...</div>
        )}

        {error && (
            <div className="text-center text-red-600">Error: {error}</div>
        )}

    </div>
  );
}

export default EditLeadPage;