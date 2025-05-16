import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Firestore config
import { useAuth } from '../contexts/authContext';

function EditEventPage() { // Review for mobile responsiveness, especially form layout.
  const { eventId } = useParams(); // Get eventId from URL
  const { user, userRole, companyId } = useAuth(); // Get user, userRole and companyId from Auth context
  const navigate = useNavigate(); // Note: user is not directly used here but included for completeness from useAuth

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    eventType: '',
    maxVolunteers: '',
    status: 'Scheduled', // default status
    description: '',
    assignedVolunteers: [], // IDs of volunteers assigned
  });

  // Track previous state for notifications
  const [previousStatus, setPreviousStatus] = useState('');
  const [previousAssignedVolunteers, setPreviousAssignedVolunteers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null); // Success or failure message for the user
  const [saveError, setSaveError] = useState(null);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [errors, setErrors] = useState({});

  // Placeholder function for triggering email notifications
  const triggerEmailNotification = (type, data) => {
    // TODO: Implement actual email notification via backend (Firebase Function)
    console.log(`--- Email Notification Triggered ---\nType: ${type}\nData:`, data);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!user?.companyId || !eventId) {
        setError('Company ID or Event ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const eventDocRef = doc(db, 'data', companyId, 'events', eventId);
        const eventDocSnap = await getDoc(doc(db, 'data', user.companyId, 'events', eventId));

        if (eventDocSnap.exists()) {
          const eventData = eventDocSnap.data();

          setFormData({
            title: eventData.title || '',
            date:
              eventData.date instanceof Date
                ? eventData.date.toISOString().split('T')[0]
                : eventData.date || '',
            time: eventData.time || '',
            location: eventData.location || '',
            eventType: eventData.eventType || '',
            maxVolunteers: eventData.maxVolunteers || '',
            assignedVolunteers: eventData.assignedVolunteers || [],
            status: eventData.status || 'Scheduled',
            description: eventData.description || '',
          });

          setPreviousStatus(eventData.status || 'Scheduled');
          setPreviousAssignedVolunteers(eventData.assignedVolunteers || []);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to fetch event data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchAllVolunteers = () => {
      if (!user?.companyId) return;

      setVolunteersLoading(true);
      const volunteersRef = collection(db, 'data', user.companyId, 'volunteers');
      const q = query(volunteersRef);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const volunteersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            name: doc.data().name || 'Unnamed Volunteer',
          }));
          setAllVolunteers(volunteersData);
          setVolunteersLoading(false);
        },
        (err) => {
          console.error('Error fetching all volunteers:', err);
          setVolunteersLoading(false);
        }
      );
      return unsubscribe;
    };

    fetchEventData();
    const unsubscribeVolunteers = fetchAllVolunteers();

    // Cleanup volunteer listener on unmount
    return () => {
      if (unsubscribeVolunteers) unsubscribeVolunteers();
    };
  }, [user?.companyId, eventId]);

  // Basic role check (adjust roles as needed)
  if (!['admin', 'Manager', 'Outreach Officer'].includes(userRole)) {
    return <div style={{ padding: '2rem', color: 'red' }}>You do not have permission to edit events.</div>;
  }

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Event title is required.';
        break;
      case 'date':
        if (!value) {
          error = 'Date is required.';
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(value);
          if (selectedDate < today) {
            error = 'Date must be in the future.';
          }
        }
        break;
      case 'location':
        if (!value.trim()) error = 'Location is required.';
        break;
      case 'description':
        if (value.length > 500) error = 'Description cannot exceed 500 characters.';
        break;
      case 'maxVolunteers':
        if (value !== '' && (isNaN(value) || parseInt(value) < 0)) {
          error = 'Max Volunteers must be a non-negative number.';
        }
        break;
      case 'status':
        if (!value.trim()) error = 'Status is required.';
        break;
      case 'eventType':
        if (!value.trim()) error = 'Event type is required.';
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName + 'Error'] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVolunteerSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedVolunteerIds = selectedOptions.map((option) => option.value);
    setFormData((prevState) => ({
      ...prevState,
      assignedVolunteers: selectedVolunteerIds,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Real-time validation (optional)
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name + 'Error']: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setFeedbackMessage(null);
    setSaveError(null);

    const isFormValid = validateForm();
    if (!isFormValid) {
      setSaveLoading(false);
      setSaveError('Please fix the errors above.');
      return;
    }

    try {
      const eventDocRef = doc(db, 'data', user.companyId, 'events', eventId);
      await updateDoc(eventDocRef, formData);

      // Trigger notifications if relevant fields changed
      if (formData.status !== previousStatus) {
        triggerEmailNotification('eventStatusUpdate', {
          eventId,
          newStatus: formData.status,
          eventTitle: formData.title,
        });
      }

      // Check for volunteers added/removed
      const addedVolunteers = formData.assignedVolunteers.filter(
        (id) => !previousAssignedVolunteers.includes(id)
      );
      const removedVolunteers = previousAssignedVolunteers.filter(
        (id) => !formData.assignedVolunteers.includes(id)
      );

      if (addedVolunteers.length > 0) {
        triggerEmailNotification('volunteersAdded', { eventId, addedVolunteers });
      }
      if (removedVolunteers.length > 0) {
        triggerEmailNotification('volunteersRemoved', { eventId, removedVolunteers });
      }

      setFeedbackMessage({ type: 'success', text: 'Event updated successfully!' });
      // Update previous states
      setPreviousStatus(formData.status);
      setPreviousAssignedVolunteers(formData.assignedVolunteers);

      // Navigate to event detail page (adjust as needed)
      navigate('/events/' + eventId);
    } catch (err) {
      console.error('Error updating event data:', err);
      setSaveError('Failed to update event data.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div>Loading event data...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  const displayError = saveError || error;

  return (
    <div className="edit-event-container" style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>Edit Event</h2>

      {displayError && <div style={{ color: 'red', marginBottom: '1rem' }}>{displayError}</div>}
      {feedbackMessage && (
        <div
          style={{
            color: feedbackMessage.type === 'success' ? 'green' : 'red',
            marginBottom: '1rem',
          }}
        >
          {feedbackMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="title">Event Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.titleError && <p style={{ color: 'red' }}>{errors.titleError}</p>}
        </div>

        {/* Date */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="date">Date*</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]} // prevent past dates
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.dateError && <p style={{ color: 'red' }}>{errors.dateError}</p>}
        </div>

        {/* Time */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="time">Time</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {/* Time optional, so no error */}
        </div>

        {/* Location */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="location">Location*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            maxLength={200}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.locationError && <p style={{ color: 'red' }}>{errors.locationError}</p>}
        </div>

        {/* Event Type */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="eventType">Event Type*</label>
          <select
            id="eventType"
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="" disabled>
              Select event type
            </option>
            <option value="Charity">Charity</option>
            <option value="Awareness">Awareness</option>
            <option value="Fundraiser">Fundraiser</option>
            <option value="Community">Community</option>
            {/* Add other event types as needed */}
          </select>
          {errors.eventTypeError && <p style={{ color: 'red' }}>{errors.eventTypeError}</p>}
        </div>

        {/* Max Volunteers */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="maxVolunteers">Max Volunteers</label>
          <input
            type="number"
            id="maxVolunteers"
            name="maxVolunteers"
            value={formData.maxVolunteers}
            onChange={handleChange}
            min={0}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.maxVolunteersError && <p style={{ color: 'red' }}>{errors.maxVolunteersError}</p>}
        </div>

        {/* Status */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="status">Status*</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {errors.statusError && <p style={{ color: 'red' }}>{errors.statusError}</p>}
        </div>

        {/* Assigned Volunteers */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="assignedVolunteers">Assign Volunteers</label>
          {volunteersLoading ? (
            <p>Loading volunteers...</p>
          ) : (
            <select
              multiple
              id="assignedVolunteers"
              name="assignedVolunteers"
              value={formData.assignedVolunteers}
              onChange={handleVolunteerSelectChange}
              style={{ width: '100%', height: '150px', padding: '0.5rem' }}
            >
              {allVolunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.id}>
                  {volunteer.name}
                </option>
              ))}
            </select>
          )}
          <small>Hold Ctrl (Cmd on Mac) to select multiple volunteers.</small>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.descriptionError && <p style={{ color: 'red' }}>{errors.descriptionError}</p>}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={saveLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: saveLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditEventPage;
