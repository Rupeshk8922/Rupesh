import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore'; // Import collection, query, getDocs
import { db } from '../firebase/config'; // Firestore config
import { useAuth } from '../contexts/authContext'; // Custom Auth Context - Normalized import

  const { volunteerId } = useParams(); // Get volunteerId from URL
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    availability: [], // Initialize as array for multiselect
    interests: [],    // Initialize as array for multiselect
    location: '',
    joinedAt: null, // Firestore Timestamp
    status: 'Active', // Default status
    assignedEvents: [] // Array of event IDs assigned to this volunteer
  });

  // Loading and Error states for initial data fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for available events to assign
  const [availableEvents, setAvailableEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Loading and Error states for save operation
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Validation error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [availabilityError, setAvailabilityError] = useState(''); // For multiselect validation
  const [interestsError, setInterestsError] = useState('');    // For multiselect validation
  const [locationError, setLocationError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [assignedEventsError, setAssignedEventsError] = useState(''); // Validation for assigned events

function EditVolunteerPage() {
  const { volunteerId } = useParams(); // Get volunteerId from URL
  const { companyId, userRole } = useAuth(); // Auth context - Corrected import and usage
  const navigate = useNavigate();

  // Fetch volunteer data on component mount or ID change
  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!companyId || !volunteerId) {
        setError('Company ID or Volunteer ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
        const volunteerDocSnap = await getDoc(volunteerDocRef);

        if (volunteerDocSnap.exists()) {
          const volunteerData = volunteerDocSnap.data();
          setFormData({
            name: volunteerData.name || '',
            email: volunteerData.email || '',
            phone: volunteerData.phone || '',
            availability: volunteerData.availability || [],
            interests: volunteerData.interests || [],
            location: volunteerData.location || '',
            joinedAt: volunteerData.joinedAt || null,
            status: volunteerData.status || 'Active',
            assignedEvents: volunteerData.assignedEvents || []
          });
        } else {
          setError('Volunteer not found.');
        }
      } catch (err) {
        console.error('Error fetching volunteer data:', err);
        setError('Failed to fetch volunteer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerData();
  }, [companyId, volunteerId]);

  // Fetch list of available events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!companyId) {
        setEventsError('Company ID is missing for fetching events.');
        setEventsLoading(false);
        return;
      }
      try {
        const eventsCollectionRef = collection(db, 'data', companyId, 'events');
        const q = query(eventsCollectionRef);
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Unnamed Event', // Fetch event title for display
        }));
        setAvailableEvents(eventsList);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEventsError('Failed to load events for assignment.');
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, [companyId]);

  // Basic role check (adjust as needed for your application's roles)
  if (userRole !== 'admin' && userRole !== 'Manager' && userRole !== 'Outreach Officer') {
    return <div style={{ padding: '2rem', color: 'red' }}>You do not have permission to edit volunteers.</div>;
  }

  // --- Validation Functions ---
  const validateName = (name) => {
    if (!name.trim()) return 'Full Name is required';
    if (name.trim().length < 2) return 'Full Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email Address is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePhone = (phone) => {
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return 'Invalid Indian phone number format (10 digits starting with 6-9)';
    return '';
  };

  const validateAvailability = (availability) => {
    // Add validation if needed, e.g., minimum/maximum selected
    return '';
  };

  const validateInterests = (interests) => {
    // Add validation if needed
    return '';
  };

  const validateLocation = (location) => {
    if (location && location.trim().length < 2) return 'Location/City must be at least 2 characters';
    return '';
  };

  const validateStatus = (status) => {
    if (!status) return 'Status is required';
    const validStatuses = ['Active', 'Inactive', 'On Leave']; // Example statuses
    if (!validStatuses.includes(status)) return 'Invalid Status selected';
    return '';
  };

  const validateAssignedEvents = (assignedEvents) => {
    // Add validation if needed, e.g., minimum/maximum assigned events
    return '';
  };

  // Helper to validate a single field and return error message
  const validateField = (name, value) => {
    switch (name) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'availability': return validateAvailability(value);
      case 'interests': return validateInterests(value);
      case 'location': return validateLocation(value);
      case 'status': return validateStatus(value);
      case 'assignedEvents': return validateAssignedEvents(value);
      default: return '';
    }
  };

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Perform validation on change for text/select inputs
    const errorMsg = validateField(name, value);
    if (name === 'name') setNameError(errorMsg);
    else if (name === 'email') setEmailError(errorMsg);
    else if (name === 'phone') setPhoneError(errorMsg);
    else if (name === 'location') setLocationError(errorMsg);
    else if (name === 'status') setStatusError(errorMsg);
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData(prevState => ({
      ...prevState,
      [name]: selectedValues
    }));
    // Validate the multiselect field
    const errorMsg = validateField(name, selectedValues);
    if (name === 'availability') setAvailabilityError(errorMsg);
    else if (name === 'interests') setInterestsError(errorMsg);

    // TODO: Trigger Volunteer Engagement Reminder or other relevant email if Availability changes
    triggerEmailNotification('volunteerAvailabilityUpdate', { volunteerData: { ...formData, [name]: selectedValues } });
  };

  const handleAssignedEventsChange = (e) => {
    const options = e.target.options;
    const selectedEvents = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedEvents.push(options[i].value); // Store event ID
      }
    }
    setFormData(prevState => ({ ...prevState, assignedEvents: selectedEvents }));
    const errorMsg = validateField('assignedEvents', selectedEvents);
    setAssignedEventsError(errorMsg);

    // TODO: Trigger Volunteer Engagement Reminder or Event Confirmation Email if Assigned Events change
    triggerEmailNotification('volunteerAssignedEventsUpdate', { volunteerData: { ...formData, assignedEvents: selectedEvents }, assignedEventsData: selectedEvents });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);

    // Validate all fields and store errors
    const newErrors = {
      nameError: validateName(formData.name),
      emailError: validateEmail(formData.email),
      phoneError: validatePhone(formData.phone),
      availabilityError: validateAvailability(formData.availability),
      interestsError: validateInterests(formData.interests),
      locationError: validateLocation(formData.location),
      statusError: validateStatus(formData.status),
      assignedEventsError: validateAssignedEvents(formData.assignedEvents)
    };

    // Update individual error states
    setNameError(newErrors.nameError);
    setEmailError(newErrors.emailError);
    setPhoneError(newErrors.phoneError);
    setAvailabilityError(newErrors.availabilityError);
    setInterestsError(newErrors.interestsError);
    setLocationError(newErrors.locationError);
    setStatusError(newErrors.statusError);
    setAssignedEventsError(newErrors.assignedEventsError);

    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some(errorMsg => errorMsg !== '');

    if (hasErrors) {
      setSaveError('Please fix the errors above.');
      setSaveLoading(false);
      return;
    }

    try {
      const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
      const dataToUpdate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        availability: formData.availability,
        interests: formData.interests,
        location: formData.location,
        status: formData.status,
        assignedEvents: formData.assignedEvents,
      };
      await updateDoc(volunteerDocRef, dataToUpdate);
      console.log('Volunteer updated successfully');
      navigate(`/volunteers/${volunteerId}`); // Navigate to the volunteer details page
    } catch (err) {
      console.error('Error updating volunteer data:', err);
      setSaveError('Failed to update volunteer data.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Placeholder function for triggering email notifications
  const triggerEmailNotification = (type, data) => {
    // TODO: Integrate with a backend service to send actual emails
    console.log(`Placeholder Email Triggered: ${type}`, data);
  };

  // Combined loading and error states for initial render
  const overallLoading = loading || eventsLoading;
  const overallError = error || eventsError;

  if (overallLoading) return <div className="p-4 text-center text-gray-600">Loading data...</div>;
  if (overallError) return <div className="p-4 text-center text-red-600">Error: {overallError}</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow-md rounded-lg my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Volunteer</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {nameError && <p className="text-red-500 text-xs italic mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {emailError && <p className="text-red-500 text-xs italic mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {phoneError && <p className="text-red-500 text-xs italic mt-1">{phoneError}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="availability">Availability</label>
          <select
            multiple
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleMultiSelectChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends', 'Evenings'].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {availabilityError && <p className="text-red-500 text-xs italic mt-1">{availabilityError}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interests">Interests</label>
          <select
            multiple
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleMultiSelectChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          >
            {['Education', 'Health', 'Environment', 'Community Support', 'Fundraising', 'Logistics'].map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          {interestsError && <p className="text-red-500 text-xs italic mt-1">{interestsError}</p>}
        </div>

        {/* Location field (editable by Admin, Manager, CSR, Outreach) */}
        {userRole && ['admin', 'Manager', 'Outreach Officer'].includes(userRole) && (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Location/City</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {locationError && <p className="text-red-500 text-xs italic mt-1">{locationError}</p>}
          </div>
        )}

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status || 'Active'}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
          {statusError && <p className="text-red-500 text-xs italic mt-1">{statusError}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignedEvents">Assigned Events</label>
          {eventsLoading ? (
            <p className="text-gray-600">Loading events...</p>
          ) : eventsError ? (
            <p className="text-red-500 text-xs italic">{eventsError}</p>
          ) : (
            <select
              multiple
              id="assignedEvents"
              name="assignedEvents"
              value={formData.assignedEvents}
              onChange={handleAssignedEventsChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            >
              {availableEvents.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          )}
          {assignedEventsError && <p className="text-red-500 text-xs italic mt-1">{assignedEventsError}</p>}
        </div>

        {saveError && <p className="text-red-500 text-center mb-4">{saveError}</p>}

        <button
          type="submit"
          disabled={saveLoading ||
            !!nameError ||
            !!emailError ||
            !!phoneError ||
            !!availabilityError ||
            !!interestsError ||
            !!locationError ||
            !!statusError ||
            !!assignedEventsError ||
            !formData.name || !formData.email || !formData.status
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out w-full font-semibold"
        >
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditVolunteerPage;