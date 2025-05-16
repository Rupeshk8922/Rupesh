jsx
import React from 'react';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Adjust path as needed
import { useAuth } from '../../contexts/authContext'; // Adjust path as needed

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
  const [nameError, setNameError] = useState('');
  const [eventTypeError, setEventTypeError] = useState('');
  const [dateError, setDateError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [volunteerCapacityError, setVolunteerCapacityError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change for real-time feedback
    if (name === 'name') setNameError('');
    if (name === 'eventType') setEventTypeError('');
    if (name === 'date') setDateError('');
    if (name === 'location') setLocationError('');
    if (name === 'volunteerCapacity') setVolunteerCapacityError('');
  };

  const validateName = (name) => {
    if (name.trim() === '') return 'Event name is required.';
    return '';
  };

  const validateDate = (date) => {
    if (!date) return 'Event date is required.';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    if (selectedDate < today) return 'Please select a valid future date.';
    return '';
  };

  const validateLocation = (location) => {
    if (location.trim() === '') return 'Location is required.';
    return '';
  };

  const validateVolunteerCapacity = (maxVolunteers) => {
    if (maxVolunteers === '' || maxVolunteers === null) return ''; // Optional field for required
    const numVolunteers = Number(maxVolunteers);
    if (!Number.isInteger(numVolunteers) || numVolunteers < 1) return 'Enter a valid positive number for volunteer capacity.';
    return '';
  };

  const validateEventType = (eventType) => {
    if (eventType === '') return 'Event type is required.';
    return '';
  };

  // Define a basic validation for description length (assuming max 300 chars)
  const validateDescription = (description) => {
    if (description && description.length > 300) return 'Description must be under 300 characters.';
    return '';
  };
  const { companyId } = useAuth(); // Get companyId from Auth context

  const validateForm = () => {
    const nameValid = validateName(formData.name) === '';
    const eventTypeValid = validateEventType(formData.eventType) === '';
    const dateValid = validateDate(formData.date) === '';
    const locationValid = validateLocation(formData.location) === '';
    const volunteerCapacityValid = validateVolunteerCapacity(formData.volunteerCapacity) === ''; // Optional field validation
    const descriptionValid = validateDescription(formData.description) === ''; // Description validation

    return nameValid && eventTypeValid && dateValid && locationValid && volunteerCapacityValid && descriptionValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation on submit to set errors if any
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
    // setDescriptionError(descriptionErr); // Need to add description error state

    // If any required field has an error, stop submission
    if (nameErr || eventTypeErr || dateErr || locationErr || volunteerCapacityErr) {
      return;
    }

    setIsLoading(true);
    setEventCreationStatus(null); // Reset status on new submission

    if (!companyId) {
      console.error('Company ID is not available.');
      setEventCreationStatus('error');
      setIsLoading(false);
      return;
    }

    try { // Moved catch block inside try-finally
      const eventsCollectionRef = collection(db, 'data', companyId, 'events');
      await addDoc(eventsCollectionRef, formData);
      setEventCreationStatus('success');
      setFormData({
        name: '',
        eventType: '',
        date: '',
        description: '',
        location: '',
        volunteerCapacity: '',
      });
      // Clear errors on successful submission
      setNameError('');
      setEventTypeError('');
      setDateError('');
      setLocationError('');
      setVolunteerCapacityError('');
      // setDescriptionError(''); // Clear description error

    } catch (error) {
      console.error('Error adding event:', error);
      setEventCreationStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  const eventTypes = ['Webinar', 'Fundraiser', 'Awareness Campaign']; // Predefined event types
  const [descriptionError, setDescriptionError] = useState(''); // State for description error

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Add New Event</h2>

      {eventCreationStatus === 'success' && (
        <p className="text-green-600 mb-4">Event added successfully!</p>
      )}
      {eventCreationStatus === 'error' && (
        <p className="text-red-500 mb-4">Error adding event. Please try again.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => setNameError(validateName(formData.name))}
            // TODO: Review responsiveness. block w-full makes it full width on all screens.
            // If needed, consider using sm:w-1/2 or md:w-full if combining fields on larger screens.
            // For a simple stacked form, w-full is good for mobile.
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
            // TODO: Review responsiveness. Similar to input, w-full is good for mobile.
            // Ensure consistent width across form fields.
            // Tailwind's default form styling helps here.
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
          <input type="date" name="date" value={formData.date} onChange={handleChange} onBlur={() => setDateError(validateDate(formData.date))}
          // TODO: Date input responsiveness. w-full is generally fine for mobile.
          // Ensure consistent vertical stacking with other fields.
           className={`mt-1 block w-full border ${dateError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`} />
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
            // TODO: Review responsiveness. w-full is good for mobile.
            // Ensure consistent styling and stacking.
            className={`mt-1 block w-full border ${locationError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          />
          {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea name="description" value={formData.description} onChange={handleChange} onBlur={() => setDescriptionError(validateDescription(formData.description))}
          // TODO: Textarea responsiveness. w-full is appropriate for mobile.
          // Ensure it doesn't overflow horizontally and stacks correctly.
          className={`mt-1 block w-full border ${descriptionError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}></textarea>
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
            // TODO: Number input responsiveness. w-full is fine for mobile.
            // Ensure consistent stacking and styling.
            className={`mt-1 block w-full border ${volunteerCapacityError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
            min="1" // Add min attribute for number input
          />
          {volunteerCapacityError && <p className="text-red-500 text-sm mt-1">{volunteerCapacityError}</p>}
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? 'Saving...' : 'Save Event'}
        </button>

      </form>
    </div>
  );
}

export default AddEventForm;