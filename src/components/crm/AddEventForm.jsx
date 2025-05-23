import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path as needed
import { useAuth } from '../context/AuthContext'; // or wherever your hook is

function AddEventForm() {
  const { companyId } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    date: '',
    description: '',
    location: '',
    volunteerCapacity: '',
  });

  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eventCreationStatus, setEventCreationStatus] = useState(null); // 'success' | 'error' | null

  // Validation functions (you need to implement these or import them)
  const validateName = (name) => (name.trim() ? '' : 'Name is required');
  const validateEventType = (type) => (type ? '' : 'Event type is required');
  const validateDate = (date) => (date ? '' : 'Date is required');
  const validateLocation = (location) => (location.trim() ? '' : 'Location is required');
  const validateVolunteerCapacity = (capacity) => {
    if (!capacity) return '';
    return isNaN(capacity) || Number(capacity) < 0 ? 'Enter a valid number' : '';
  };
  const validateDescription = (desc) => (desc.trim() ? '' : 'Description is required');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(formData.name);
    const eventTypeErr = validateEventType(formData.eventType);
    const dateErr = validateDate(formData.date);
    const locationErr = validateLocation(formData.location);
    const volunteerCapacityErr = validateVolunteerCapacity(formData.volunteerCapacity);
    const descriptionErr = validateDescription(formData.description);

    setNameError(nameErr);
    
    if (nameErr || eventTypeErr || dateErr || locationErr || volunteerCapacityErr || descriptionErr) {
      return;
    }

    if (!companyId) {
      console.error('Company ID is not available.');
      setEventCreationStatus('error');
      return;
    }

    setIsLoading(true);
    setEventCreationStatus(null);

    try {
      const eventsCollectionRef = collection(db, 'data', companyId, 'events');

      const eventDataToSave = {
        ...formData,
        volunteerCapacity: formData.volunteerCapacity ? Number(formData.volunteerCapacity) : null,
      };

      await addDoc(eventsCollectionRef, eventDataToSave);

      setEventCreationStatus('success');
      setFormData({
        name: '',
        eventType: '',
        date: '',
        description: '',
        location: '',
        volunteerCapacity: '',
      });

      setNameError('');
    } catch (error) {
      console.error('Error adding event:', error);
      setEventCreationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Inputs and error messages here, e.g.: */}
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Event Name"
        required
      />
      {nameError && <p className="error">{nameError}</p>}

      {/* Repeat for other fields... */}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Event'}
      </button>

      {eventCreationStatus === 'success' && <p className="success">Event created successfully!</p>}
      {eventCreationStatus === 'error' && <p className="error">Failed to create event.</p>}
    </form>
  );
}

export default AddEventForm;
