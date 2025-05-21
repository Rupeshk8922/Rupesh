import { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useVolunteers } from '../../hooks/useVolunteers';

function AddVolunteerForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skillsInterests: '',
    availability: '',
    location: '',
    preferredCauses: '',
    status: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [skillsInterestsError, setSkillsInterestsError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [preferredCausesError, setPreferredCausesError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [notesError, setNotesError] = useState('');

  const { companyId } = useAuth();
  const { addVolunteer } = useVolunteers();

  if (!companyId) {
    return <div className="p-4 text-red-600">Company ID is missing. Cannot add volunteer.</div>;
  }

  // -------------------- Validation Functions --------------------
  const validateFullName = (name) => {
    if (!name.trim()) return 'Full Name is required';
    if (name.trim().length < 3) return 'Full Name must be at least 3 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email Address is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePhone = (phone) => {
    if (phone && !/^[6-9]\d{9}$/.test(phone))
      return 'Invalid Indian phone number format (10 digits starting with 6-9)';
    return '';
  };

  const validateSkillsInterests = (skills) => (skills.length > 500 ? 'Skills/Interests cannot exceed 500 characters' : '');
  const validateAvailability = (availability) => (availability.length > 500 ? 'Availability cannot exceed 500 characters' : '');
  const validateLocation = (location) => (location && location.trim().length < 2 ? 'Location/City must be at least 2 characters' : '');
  const validatePreferredCauses = (causes) => (causes.length > 500 ? 'Preferred Causes cannot exceed 500 characters' : '');
  const validateStatus = (status) => {
    if (!status) return 'Status is required';
    const validStatuses = ['Active', 'Inactive', 'On Leave'];
    return validStatuses.includes(status) ? '' : 'Invalid Status selected';
  };
  const validateNotes = (notes) => (notes.length > 500 ? 'Notes cannot exceed 500 characters' : '');

  // -------------------- Submit Handler --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);

    const newErrors = {
      fullNameError: validateFullName(formData.fullName),
      emailError: validateEmail(formData.email),
      phoneError: validatePhone(formData.phone),
      skillsInterestsError: validateSkillsInterests(formData.skillsInterests),
      availabilityError: validateAvailability(formData.availability),
      locationError: validateLocation(formData.location),
      preferredCausesError: validatePreferredCauses(formData.preferredCauses),
      statusError: validateStatus(formData.status),
      notesError: validateNotes(formData.notes),
    };

    const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([, value]) => value !== ''));

    if (Object.keys(filteredErrors).length > 0) {
      setFullNameError(filteredErrors.fullNameError || '');
      setEmailError(filteredErrors.emailError || '');
      setPhoneError(filteredErrors.phoneError || '');
      setSkillsInterestsError(filteredErrors.skillsInterestsError || '');
      setAvailabilityError(filteredErrors.availabilityError || '');
      setLocationError(filteredErrors.locationError || '');
      setPreferredCausesError(filteredErrors.preferredCausesError || '');
      setStatusError(filteredErrors.statusError || '');
      setNotesError(filteredErrors.notesError || '');
      setError('Please fix the errors above.');
      return;
    }

    setLoading(true);
    try {
      await addVolunteer(companyId, {
        ...formData,
        createdAt: new Date(),
      });

      setSuccessMessage('Volunteer added successfully!');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        skillsInterests: '',
        availability: '',
        location: '',
        preferredCauses: '',
        status: '',
        notes: '',
      });

      setFullNameError('');
      setEmailError('');
      setPhoneError('');
      setSkillsInterestsError('');
      setAvailabilityError('');
      setLocationError('');
      setPreferredCausesError('');
      setStatusError('');
      setNotesError('');
    } catch (err) {
      console.error('Error adding volunteer:', err);
      setError('Failed to add volunteer.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Field Change Handler --------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live validation
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
      case 'skillsInterests':
        setSkillsInterestsError(validateSkillsInterests(value));
        break;
      case 'availability':
        setAvailabilityError(validateAvailability(value));
        break;
      case 'location':
        setLocationError(validateLocation(value));
        break;
      case 'preferredCauses':
        setPreferredCausesError(validatePreferredCauses(value));
        break;
      case 'status':
        setStatusError(validateStatus(value));
        break;
      case 'notes':
        setNotesError(validateNotes(value));
        break;
      default:
        break;
    }
  };

  // -------------------- JSX --------------------
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Add New Volunteer</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block font-medium">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {fullNameError && <p className="text-red-500 text-sm">{fullNameError}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block font-medium">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
        </div>

        {/* Skills/Interests */}
        <div>
          <label htmlFor="skillsInterests" className="block font-medium">Skills/Interests</label>
          <textarea
            id="skillsInterests"
            name="skillsInterests"
            value={formData.skillsInterests}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {skillsInterestsError && <p className="text-red-500 text-sm">{skillsInterestsError}</p>}
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="availability" className="block font-medium">Availability</label>
          <textarea
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {availabilityError && <p className="text-red-500 text-sm">{availabilityError}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block font-medium">Location/City</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {locationError && <p className="text-red-500 text-sm">{locationError}</p>}
        </div>

        {/* Preferred Causes */}
        <div>
          <label htmlFor="preferredCauses" className="block font-medium">Preferred Causes</label>
          <textarea
            id="preferredCauses"
            name="preferredCauses"
            value={formData.preferredCauses}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {preferredCausesError && <p className="text-red-500 text-sm">{preferredCausesError}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block font-medium">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
          {statusError && <p className="text-red-500 text-sm">{statusError}</p>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block font-medium">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {notesError && <p className="text-red-500 text-sm">{notesError}</p>}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={
              loading ||
              !!fullNameError ||
              !!emailError ||
              !!phoneError ||
              !!skillsInterestsError ||
              !!availabilityError ||
              !!locationError ||
              !!preferredCausesError ||
              !!statusError ||
              !!notesError ||
              !formData.fullName ||
              !formData.email ||
              !formData.status
            }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Volunteer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddVolunteerForm;
