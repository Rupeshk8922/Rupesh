import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '../../firebase/config'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// Ensure userRole is available
function AddLeadForm() {
  const navigate = useNavigate(); // Get the navigate function
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: '', // e.g., 'New', 'Contacted', 'Qualified', 'Disqualified'
    notes: '',
  });

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [notesError, setNotesError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { userRole, companyId } = useAuth(); // Get the userRole and companyId

  // Validation functions (simplified for brevity, add more robust logic as needed)
  const validateFullName = (name) => {
    if (!name) return 'Full Name is required.';
    if (name.length < 3) return 'Full Name must be at least 3 characters.';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format.';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return ''; // Phone is optional
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
    if (!phoneRegex.test(phone)) return 'Invalid Indian phone number format (10 digits starting with 6-9).';
    return '';
  };

  const validateStatus = (status) => {
    if (!status) return 'Status is required.';
    // Add more specific status validation if you have predefined options
    return '';
  };


  const validateNotes = (notes) => {
    if (notes.length > 500) return 'Notes cannot exceed 500 characters.';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Trigger validation on change (optional, but good for immediate feedback)
    switch (name) {
      case 'fullName':
        setFullNameError(validateFullName(value));
        break;
      case 'email':
        setEmailError(validateEmail(value));
        break;
      case 'phone':
        setPhoneError(validatePhone(value));
        break;
      case 'status':
        setStatusError(validateStatus(value));
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    const fullNameErr = validateFullName(formData.fullName);
    if (fullNameErr) {
      newErrors.fullName = fullNameErr;
      isValid = false;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      newErrors.email = emailErr;
      isValid = false;
    }

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      newErrors.phone = phoneErr;
      isValid = false;
    }

    const statusErr = validateStatus(formData.status);
    if (statusErr) {
      newErrors.status = statusErr;
      isValid = false;
    }

    const notesErr = validateNotes(formData.notes);
    if (notesErr) {
      newErrors.notes = notesErr;
      isValid = false;
    }

    setFullNameError(newErrors.fullName || '');
    setEmailError(newErrors.email || '');
    setPhoneError(newErrors.phone || '');
    setStatusError(newErrors.status || '');
    setNotesError(newErrors.notes || '');

    return isValid;
  };


  const handleSubmit = async (e) => {
      e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const isValid = validateForm();

    if (!isValid) {
      setError('Please fix the errors in the form.');
      return;
    }

    if (!companyId) {
      setError('Company ID not available.');
      return;
    }

    setLoading(true);

    try {
      const leadsCollectionRef = collection(db, 'data', companyId, 'leads');
      await addDoc(leadsCollectionRef, formData);
      console.log('Lead added successfully!');
      setSuccessMessage('Lead added successfully!');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        status: '',
        notes: '',
      });
      // Clear individual errors after successful submission
      setFullNameError('');
      setEmailError('');
      setPhoneError('');
      setStatusError('');

      navigate('/leads'); // Navigate to the leads list page


    } catch (err) {
      console.error('Error adding lead:', err);    setError('Failed to add lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

   // Check if required fields are empty
   const requiredFieldsEmpty = !formData.fullName || !formData.email || !formData.status;

   // Check if there are any validation errors
   const hasErrors = fullNameError || emailError || phoneError || statusError || notesError;


   if (!companyId) { return <div className="p-4 text-red-500">Company ID is required to add a lead.</div>; }
  return (
    <div className="p-4">
      {/* 
        Consider mobile responsiveness for the main container padding.
        The 'p-4' class provides padding that works reasonably well,
        but ensure it's consistent with the rest of the application's
        mobile padding strategy. 
      */}
      <h2 className="text-xl font-bold mb-4">Add New Lead</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* 
            Form fields are stacked vertically due to the parent 'space-y-4' class.
            The label is a block element, ensuring it's above the input on smaller screens.
            Input fields use 'w-full' to take up the full width, ensuring they don't overflow.
            Error messages also appear below the input. This structure is generally mobile-friendly.
          */}
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${fullNameError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            required
          />
          {fullNameError && <p className="text-red-500 text-sm">{fullNameError}</p>}
        </div>

        <div>
          {/* 
            Similar to the Full Name field, the email field stacks vertically.
            'w-full' ensures the input scales correctly.
            Validation error is displayed below the input.
            This layout is responsive.
          */}
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${emailError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            required
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        <div>
          {/* 
            Phone number field also stacks vertically and uses 'w-full'.
            The optional nature of this field means its absence doesn't break layout.
            Error message positioning is consistent.
            Responsive layout is maintained.
          */}
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${phoneError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
           {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
        </div>

        <div>
          {/* 
            Status field follows the same responsive pattern with vertical stacking and 'w-full' input.
            The 'disabled' attribute does not affect layout responsiveness, but user interaction.
            Error message placement is consistent.
            The current layout is mobile-friendly.
          */}
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <input
            type="text"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${statusError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            disabled={userRole && !['admin', 'CSR', 'Outreach Officer'].includes(userRole)} // Disable if not allowed role
            required
          />
          {statusError && <p className="text-red-500 text-sm">{statusError}</p>}
        </div>

        <div>
          {/* 
            Notes textarea also stacks vertically and uses 'w-full'.
            'rows="3"' gives it a default height, but it will scroll if needed.
            'w-full' is key for ensuring it fits within the container on all screen sizes.
            Error message placement is consistent. This is a responsive layout.
          */}
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
             rows="3"
            className={`mt-1 block w-full rounded-md border ${notesError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          ></textarea>
           {notesError && <p className="text-red-500 text-sm">{notesError}</p>}
          <button
            type="submit"
            className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || hasErrors || requiredFieldsEmpty ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
            disabled={loading || hasErrors || requiredFieldsEmpty}
          >
            {loading ? 'Adding Lead...' : 'Add Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddLeadForm;