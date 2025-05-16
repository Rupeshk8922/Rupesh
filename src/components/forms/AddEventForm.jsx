import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Adjust path if needed
import { useAuth } from '../../contexts/authContext'; // Correct import
import { useEvents } from '../../hooks/useEvents.jsx';
function AddEventForm() {
  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    date: '',
    description: '',
    location: '',
    volunteerCapacity: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [eventCreationStatus, setEventCreationStatus] = useState(null); // null, 'success', or 'error'

  // Error states for validation
  const [nameError, setNameError] = useState('');
  const [eventTypeError, setEventTypeError] = useState('');
  const [dateError, setDateError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [volunteerCapacityError, setVolunteerCapacityError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const { user } = useAuth(); // Get current user from Auth context

  // Assuming companyId is stored in user metadata or claims, adjust if different
  // Example: user?.companyId or user?.claims?.companyId depending on your setup
  // Here we'll just assume user.uid as companyId for demonstration; adjust as needed
  const companyId = user?.uid || null;

  // Validation functions
  const validateName = (name) => {
    if (name.trim() === '') return 'Event name is required.';
    return '';
  };

  const validateEventType = (eventType) => {
    if (eventType === '') return 'Event type is required.';
    return '';
  };

  const validateDate = (date) => {
    if (!date) return 'Event date is required.';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return 'Please select a valid future date.';
    return '';
  };

  const validateLocation = (location) => {
    if (location.trim() === '') return 'Location is required.';
    return '';
  };

  const validateVolunteerCapacity = (capacity) => {
    if (capacity === '' || capacity === null) return '';
    const num = Number(capacity);
    if (!Number.isInteger(num) || num < 1) return 'Enter a valid positive number for volunteer capacity.';
    return '';
  };

  const validateDescription = (description) => {
    if (description && description.length > 300) return 'Description must be under 300 characters.';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors on change for better UX
    switch (name) {
      case 'name':
        setNameError('');
        break;
      case 'eventType':
        setEventTypeError('');
        break;
      case 'date':
        setDateError('');
        break;
      case 'location':
        setLocationError('');
        break;
      case 'volunteerCapacity':
        setVolunteerCapacityError('');
        break;
      case 'description':
        setDescriptionError('');
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const nameErr = validateName(formData.name);
    const eventTypeErr = validateEventType(formData.eventType);
    const dateErr = validateDate(formData.date);
    const locationErr = validateLocation(formData.location);
    const volunteerCapacityErr = validateVolunteerCapacity(formData.volunteerCapacity);
    const descriptionErr = validateDescription(formData.description);

    setNameError(nameErr);
    setEventTypeError(eventTypeErr);
    setDateError(dateErr);
    setLocationError(locationErr);
    setVolunteerCapacityError(volunteerCapacityErr);
    setDescriptionError(descriptionErr);

    return !(nameErr || eventTypeErr || dateErr || locationErr || volunteerCapacityErr || descriptionErr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!companyId) {
      console.error('Company ID is not available.');
      setEventCreationStatus('error');
      return;
    }

    setIsLoading(true);
    setEventCreationStatus(null);

    try {
      const eventsCollectionRef = collection(db, 'data', companyId, 'events');
      await addDoc(eventsCollectionRef, {
        ...formData,
        volunteerCapacity: formData.volunteerCapacity ? Number(formData.volunteerCapacity) : null,
      });

      setEventCreationStatus('success');
      setFormData({
        name: '',
        eventType: '',
        date: '',
        description: '',
        location: '',
        volunteerCapacity: '',
      });

      // Clear errors on success
      setNameError('');
      setEventTypeError('');
      setDateError('');
      setLocationError('');
      setVolunteerCapacityError('');
      setDescriptionError('');
    } catch (error) {
      console.error('Error adding event:', error);
      setEventCreationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypes = ['Webinar', 'Fundraiser', 'Awareness Campaign'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Add New Event</h2>

      {eventCreationStatus === 'success' && (
        <p className="text-green-600 mb-4">Event added successfully!</p>
      )}
      {eventCreationStatus === 'error' && (
        <p className="text-red-500 mb-4">Error adding event. Please try again.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => setNameError(validateName(formData.name))}
            className={`mt-1 block w-full border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            onBlur={() => setEventTypeError(validateEventType(formData.eventType))}
            className={`mt-1 block w-full border ${eventTypeError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          >
            <option value="">Select Event Type</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {eventTypeError && <p className="text-red-500 text-sm mt-1">{eventTypeError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            onBlur={() => setDateError(validateDate(formData.date))}
            className={`mt-1 block w-full border ${dateError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          />
          {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            onBlur={() => setLocationError(validateLocation(formData.location))}
            className={`mt-1 block w-full border ${locationError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          />
          {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={() => setDescriptionError(validateDescription(formData.description))}
            className={`mt-1 block w-full border ${descriptionError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          />
          {descriptionError && <p className="text-red-500 text-sm mt-1">{descriptionError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Volunteer Capacity (Optional)</label>
          <input
            type="number"
            name="volunteerCapacity"
            value={formData.volunteerCapacity}
            onChange={handleChange}
            onBlur={() => setVolunteerCapacityError(validateVolunteerCapacity(formData.volunteerCapacity))}
            className={`mt-1 block w-full border ${volunteerCapacityError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
            min="1"
          />
          {volunteerCapacityError && <p className="text-red-500 text-sm mt-1">{volunteerCapacityError}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Saving...' : 'Save Event'}
        </button>
      </form>
    </div>
  );
}

export default AddEventForm;
