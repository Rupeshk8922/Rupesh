import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/pages/firebase/index.jsx';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import OfficerSelect from '@/components/shared/OfficerSelect';
const allowedRoles = ['admin', 'csr', 'project-manager'];

const CreateEventPage = () => {
  const { user, userRole, authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    eventType: 'online',
    maxVolunteers: 0,
    status: 'upcoming',
    assignedOfficer: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Auth loading screen
  if (authLoading) return <div className="p-4">Checking permissions...</div>;

  // Unauthorized access
  if (!user || !allowedRoles.includes(userRole)) {
    return <Navigate to="/access-denied" />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxVolunteers' ? Number(value) : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) {
      errors.date = 'Date is required';
    } else if (new Date(formData.date) < new Date(new Date().toDateString())) {
      errors.date = 'Date cannot be in the past';
    }

    if (formData.eventType === 'in-person' && !formData.location.trim()) {
      errors.location = 'Location is required for in-person events';
    }

    if (formData.maxVolunteers < 0) errors.maxVolunteers = 'Max volunteers cannot be negative';
    if (!formData.assignedOfficer) errors.assignedOfficer = 'Assigned officer is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () =>
    formData.title.trim() &&
    formData.description.trim() &&
    formData.date &&
    (formData.eventType !== 'in-person' || formData.location.trim()) &&
    formData.maxVolunteers >= 0 &&
    formData.assignedOfficer;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmissionLoading(true);
    setSubmissionError(null);
    setCreationSuccess(false);

    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        date: new Date(formData.date),
        createdAt: serverTimestamp(),
      });

      setCreationSuccess(true);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        eventType: 'online',
        maxVolunteers: 0,
        status: 'upcoming',
        assignedOfficer: '',
      });

      setTimeout(() => {
        navigate('/dashboard/crm/events');
      }, 1500);
    } catch (err) {
      console.error('Error creating event:', err);
      setSubmissionError('Failed to create event. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  useEffect(() => {
    if (creationSuccess) {
      const timer = setTimeout(() => setCreationSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [creationSuccess]);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-6">Create New Event</h1>

      {creationSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Event created successfully!
        </div>
      )}
      {submissionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {submissionError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="title">Title<span className="text-red-500">*</span></Label>
          <Input id="title" name="title" value={formData.title} onChange={handleInputChange} disabled={submissionLoading} />
          {formErrors.title && <p className="text-sm text-red-600">{formErrors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description<span className="text-red-500">*</span></Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} disabled={submissionLoading} />
          {formErrors.description && <p className="text-sm text-red-600">{formErrors.description}</p>}
        </div>

        <div>
          <Label htmlFor="date">Date<span className="text-red-500">*</span></Label>
          <Input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} disabled={submissionLoading} min={new Date().toISOString().split('T')[0]} />
          {formErrors.date && <p className="text-sm text-red-600">{formErrors.date}</p>}
        </div>

        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <Select value={formData.eventType} onValueChange={(value) => setFormData((prev) => ({ ...prev, eventType: value }))} disabled={submissionLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.eventType === 'in-person' && (
          <div>
            <Label htmlFor="location">Location<span className="text-red-500">*</span></Label>
            <Input id="location" name="location" value={formData.location} onChange={handleInputChange} disabled={submissionLoading} />
            {formErrors.location && <p className="text-sm text-red-600">{formErrors.location}</p>}
          </div>
        )}

        <div>
          <Label htmlFor="maxVolunteers">Max Volunteers</Label>
          <Input type="number" id="maxVolunteers" name="maxVolunteers" value={formData.maxVolunteers} onChange={handleInputChange} disabled={submissionLoading} min={0} />
          {formErrors.maxVolunteers && <p className="text-sm text-red-600">{formErrors.maxVolunteers}</p>}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))} disabled={submissionLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignedOfficer">Assign Officer<span className="text-red-500">*</span></Label>
          <OfficerSelect value={formData.assignedOfficer} onChange={(val) => setFormData((prev) => ({ ...prev, assignedOfficer: val }))} disabled={submissionLoading} />
          {formErrors.assignedOfficer && <p className="text-sm text-red-600">{formErrors.assignedOfficer}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={submissionLoading || !isFormValid()}>
          {submissionLoading ? 'Creating Event...' : 'Create Event'}
        </Button>
      </form>
    </div>
  );
};

export default CreateEventPage;
