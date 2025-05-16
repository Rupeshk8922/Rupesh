import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/authContext';


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

  if (!companyId) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        Company ID is missing. Cannot add volunteer.
      </div>
    );
  }

  // Validation functions here (unchanged)
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

  const validateSkillsInterests = (skills) => {
    if (skills.length > 500) return 'Skills/Interests cannot exceed 500 characters';
    return '';
  };

  const validateAvailability = (availability) => {
    if (availability.length > 500) return 'Availability cannot exceed 500 characters';
    return '';
  };

  const validateLocation = (location) => {
    if (location && location.trim().length < 2) return 'Location/City must be at least 2 characters';
    return '';
  };

  const validatePreferredCauses = (causes) => {
    if (causes.length > 500) return 'Preferred Causes cannot exceed 500 characters';
    return '';
  };

  const validateStatus = (status) => {
    if (!status) return 'Status is required';
    const validStatuses = ['Active', 'Inactive', 'On Leave'];
    if (!validStatuses.includes(status)) return 'Invalid Status selected';
    return '';
  };

  const validateNotes = (notes) => {
    if (notes.length > 500) return 'Notes cannot exceed 500 characters';
    return '';
  };

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

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    );

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
      const volunteersCollectionRef = collection(db, 'data', companyId, 'volunteers');
      await addDoc(volunteersCollectionRef, {
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

      // Clear errors on success
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change
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

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Add New Volunteer</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName" className="block font-medium">
            Full Name
          </label>
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

        <div>
          <label htmlFor="email" className="block font-medium">
            Email
          </label>
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

        <div>
          <label htmlFor="phone" className="block font-medium">
            Phone Number
          </label>
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

        <div>
          <label htmlFor="skillsInterests" className="block font-medium">
            Skills/Interests
          </label>
          <textarea
            id="skillsInterests"
            name="skillsInterests"
            value={formData.skillsInterests}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {skillsInterestsError && <p className="text-red-500 text-sm">{skillsInterestsError}</p>}
        </div>

        <div>
          <label htmlFor="availability" className="block font-medium">
            Availability
          </label>
          <textarea
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {availabilityError && <p className="text-red-500 text-sm">{availabilityError}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block font-medium">
            Location/City
          </label>
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

        <div>
          <label htmlFor="preferredCauses" className="block font-medium">
            Preferred Causes
          </label>
          <textarea
            id="preferredCauses"
            name="preferredCauses"
            value={formData.preferredCauses}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {preferredCausesError && <p className="text-red-500 text-sm">{preferredCausesError}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block font-medium">
            Status
          </label>
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

        <div>
          <label htmlFor="notes" className="block font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {notesError && <p className="text-red-500 text-sm">{notesError}</p>}
        </div>

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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Volunteer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddVolunteerForm;
