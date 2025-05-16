import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { useauthContext } from '../../contexts/authContext';
function AddEventForm() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    assignedTo: '',
    eventType: '',
    maxVolunteers: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [titleError, setTitleError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [assignedToError, setAssignedToError] = useState('');
  const [eventTypeError, setEventTypeError] = useState('');
  const [maxVolunteersError, setMaxVolunteersError] = useState('');

  const navigate = useNavigate();
  const { user } = useauthContext();
  const companyId = user?.companyId;

  if (!companyId) {
    return <div style={{ padding: '2rem', color: 'red' }}>Company ID is missing. Cannot add event.</div>;
  }

  // Validation Functions
  const validateTitle = (title) => (!title.trim() ? 'Event Title is required' : '');
  const validateDate = (date) => {
    if (!date) return 'Date is required';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? 'Date must be in the future' : '';
  };
  const validateTime = (time) => {
    if (!time.trim()) return 'Time is required';
    return !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time) ? 'Invalid time format (use HH:MM)' : '';
  };
  const validateLocation = (location) => (!location.trim() ? 'Location is required' : '');
  const validateDescription = (desc) => (desc.length > 500 ? 'Description cannot exceed 500 characters' : '');
  const validateEventType = (type) => (!type.trim() ? 'Event Type is required' : '');
  const validateAssignedTo = () => ''; // Optional
  const validateMaxVolunteers = (value) => {
    return value !== '' && (isNaN(value) || parseInt(value) < 0)
      ? 'Max Volunteers must be a non-negative number'
      : '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'title': return validateTitle(value);
      case 'date': return validateDate(value);
      case 'time': return validateTime(value);
      case 'location': return validateLocation(value);
      case 'description': return validateDescription(value);
      case 'assignedTo': return validateAssignedTo(value);
      case 'eventType': return validateEventType(value);
      case 'maxVolunteers': return validateMaxVolunteers(value);
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Live validation
    const fieldError = validateField(name, value);
    switch (name) {
      case 'title': setTitleError(fieldError); break;
      case 'date': setDateError(fieldError); break;
      case 'time': setTimeError(fieldError); break;
      case 'location': setLocationError(fieldError); break;
      case 'description': setDescriptionError(fieldError); break;
      case 'assignedTo': setAssignedToError(fieldError); break;
      case 'eventType': setEventTypeError(fieldError); break;
      case 'maxVolunteers': setMaxVolunteersError(fieldError); break;
      default: break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const newErrors = {
      titleError: validateTitle(formData.title),
      dateError: validateDate(formData.date),
      timeError: validateTime(formData.time),
      locationError: validateLocation(formData.location),
      descriptionError: validateDescription(formData.description),
      assignedToError: validateAssignedTo(formData.assignedTo),
      eventTypeError: validateEventType(formData.eventType),
      maxVolunteersError: validateMaxVolunteers(formData.maxVolunteers),
    };

    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) {
      setTitleError(newErrors.titleError);
      setDateError(newErrors.dateError);
      setTimeError(newErrors.timeError);
      setLocationError(newErrors.locationError);
      setDescriptionError(newErrors.descriptionError);
      setAssignedToError(newErrors.assignedToError);
      setEventTypeError(newErrors.eventTypeError);
      setMaxVolunteersError(newErrors.maxVolunteersError);
      setError('Please fix the errors above.');
      return;
    }

    setLoading(true);
    try {
      const eventsCollectionRef = collection(db, 'data', companyId, 'events');
      await addDoc(eventsCollectionRef, {
        ...formData,
        createdAt: new Date(),
      });

      setSuccessMessage('Event added successfully!');
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        assignedTo: '',
        eventType: '',
        maxVolunteers: '',
      });

      setTitleError('');
      setDateError('');
      setTimeError('');
      setLocationError('');
      setDescriptionError('');
      setAssignedToError('');
      setEventTypeError('');
      setMaxVolunteersError('');

      navigate('/events');
    } catch (err) {
      setError(err.message || 'Failed to add event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Added padding for smaller screens and a max width for larger screens for better readability
    // flex and justify-center are used to center the form on larger screens
    <div className="p-4 flex justify-center">
      {/* Added a container with max-width for the form on larger screens */}
      <div className="w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">Add New Event</h2>
      {/* Adjusted error and success message styling for better visibility */}
      {error && <p className="text-red-600">{error}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField label="Event Title" name="title" value={formData.title} error={titleError} onChange={handleChange} />
        <InputField label="Date" name="date" type="date" value={formData.date} error={dateError} onChange={handleChange} />
        <InputField label="Time" name="time" placeholder="HH:MM" value={formData.time} error={timeError} onChange={handleChange} />
        <InputField label="Location" name="location" value={formData.location} error={locationError} onChange={handleChange} />
        <TextAreaField label="Description" name="description" value={formData.description} error={descriptionError} onChange={handleChange} />
        <InputField label="Event Type" name="eventType" value={formData.eventType} error={eventTypeError} onChange={handleChange} />
        <InputField label="Assigned To" name="assignedTo" value={formData.assignedTo} error={assignedToError} onChange={handleChange} />
        <InputField label="Max Volunteers" name="maxVolunteers" type="number" value={formData.maxVolunteers} error={maxVolunteersError} onChange={handleChange} />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Adding...' : 'Add Event'}
        </button>
      </form>
      </div> {/* End of max-w-lg container */}
    </div>
  );
}

// Reusable input field
function InputField({ label, name, value, onChange, error, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}</label>
      <input
        // w-full ensures the input takes the full width of its container on all screen sizes
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // Added responsive padding and border styling
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

// Reusable textarea field
function TextAreaField({ label, name, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}</label>
      <textarea
        // w-full ensures the textarea takes the full width of its container on all screen sizes
        id={name}
        name={name}
        value={value}
        // Added responsive padding and border styling
        onChange={onChange}
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export default AddEventForm;
