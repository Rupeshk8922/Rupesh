import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/authContext';
import { triggerEmailNotification } from '@/utils/notifications';
import { OfficerSelect } from '@/components/OfficerSelect';
import MultiSelectVolunteers from '@/components/MultiSelectVolunteers';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, userRole, companyId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [initialFetchError, setInitialFetchError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [previousStatus, setPreviousStatus] = useState('');
  const [previousAssignedVolunteers, setPreviousAssignedVolunteers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    eventType: '',
    maxVolunteers: '',
    status: 'Scheduled',
    description: '',
    assignedOfficer: '',
    assignedVolunteers: [],
  });

  useEffect(() => {
    if (!user || !companyId) return;

    const fetchEventData = async () => {
      setLoading(true);
      try {
        const eventRef = doc(db, 'data', companyId, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
          setInitialFetchError('Event not found.');
          return;
        }

        const data = eventSnap.data();
        setFormData({
          title: data.title || '',
          date: data.date?.toDate?.().toISOString().split('T')[0] || '',
          time: data.time || '',
          location: data.location || '',
          eventType: data.eventType || '',
          maxVolunteers: data.maxVolunteers || '',
          status: data.status || 'Scheduled',
          description: data.description || '',
          assignedOfficer: data.assignedOfficer || '',
          assignedVolunteers: data.assignedVolunteers || [],
        });

        setPreviousStatus(data.status || 'Scheduled');
        setPreviousAssignedVolunteers(data.assignedVolunteers || []);
      } catch (err) {
        console.error(err);
        setInitialFetchError('Failed to fetch event.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onSnapshot(
      query(collection(db, 'data', companyId, 'volunteers')),
      (snapshot) => {
        const volunteers = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed',
        }));
        setAllVolunteers(volunteers);
      },
      (err) => console.error(err)
    );

    fetchEventData();
    return () => unsubscribe();
  }, [user, companyId, eventId]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.trim() ? '' : 'Title is required.';
      case 'date': {
        if (!value) return 'Date is required.';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(value) < today ? 'Date must be in the future.' : '';
      }
      case 'location':
        return value.trim() ? '' : 'Location is required.';
      case 'eventType':
        return value.trim() ? '' : 'Event type is required.';
      case 'status':
        return value.trim() ? '' : 'Status is required.';
      case 'maxVolunteers':
        return value && (!/^\d+$/.test(value) || parseInt(value) < 0)
          ? 'Invalid number.'
          : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key + 'Error'] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name + 'Error']: validateField(name, value) }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name + 'Error']: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setFeedbackMessage(null);

    if (!validateForm()) {
      setSaveError('Please fix the errors before submitting.');
      return;
    }

    setSaveLoading(true);
    try {
      const eventRef = doc(db, 'data', companyId, 'events', eventId);
      await updateDoc(eventRef, {
        ...formData,
        date: new Date(formData.date),
      });

      if (formData.status !== previousStatus) {
        triggerEmailNotification?.('eventStatusUpdate', {
          eventId,
          newStatus: formData.status,
          eventTitle: formData.title,
        });
      }

      const added = formData.assignedVolunteers.filter(
        (id) => !previousAssignedVolunteers.includes(id)
      );
      const removed = previousAssignedVolunteers.filter(
        (id) => !formData.assignedVolunteers.includes(id)
      );

      if (added.length > 0)
        triggerEmailNotification?.('volunteersAdded', { eventId, added });
      if (removed.length > 0)
        triggerEmailNotification?.('volunteersRemoved', { eventId, removed });

      setFeedbackMessage({ type: 'success', text: 'Event updated successfully!' });
      setTimeout(() => navigate(`/events/${eventId}`), 2000);
    } catch (err) {
      console.error(err);
      setSaveError('Failed to update event.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!['admin', 'Manager', 'Outreach Officer'].includes(userRole)) {
    return <div className="p-6 text-red-600">You do not have permission to edit events.</div>;
  }

  if (loading) return <div className="p-6"><Spinner /> Loading event data...</div>;
  if (initialFetchError) return <div className="p-6 text-red-600">Error: {initialFetchError}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input name="title" value={formData.title} onChange={handleChange} />
          {errors.titleError && <p className="text-red-500 text-sm">{errors.titleError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} />
            {errors.dateError && <p className="text-red-500 text-sm">{errors.dateError}</p>}
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" name="time" value={formData.time} onChange={handleChange} />
          </div>
        </div>

        <div>
          <Label>Location</Label>
          <Input name="location" value={formData.location} onChange={handleChange} />
          {errors.locationError && <p className="text-red-500 text-sm">{errors.locationError}</p>}
        </div>

        <div>
          <Label>Event Type</Label>
          <Input name="eventType" value={formData.eventType} onChange={handleChange} />
          {errors.eventTypeError && <p className="text-red-500 text-sm">{errors.eventTypeError}</p>}
        </div>

        <div>
          <Label>Status</Label>
          <Input name="status" value={formData.status} onChange={handleChange} />
          {errors.statusError && <p className="text-red-500 text-sm">{errors.statusError}</p>}
        </div>

        <div>
          <Label>Max Volunteers</Label>
          <Input name="maxVolunteers" value={formData.maxVolunteers} onChange={handleChange} />
          {errors.maxVolunteersError && (
            <p className="text-red-500 text-sm">{errors.maxVolunteersError}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </div>

        <div>
          <Label>Assigned Officer</Label>
          <OfficerSelect
            value={formData.assignedOfficer}
            onChange={(val) => handleSelectChange('assignedOfficer', val)}
          />
        </div>

        <div>
          <Label>Assigned Volunteers</Label>
          <MultiSelectVolunteers
            value={formData.assignedVolunteers}
            onChange={(val) => handleSelectChange('assignedVolunteers', val)}
            options={allVolunteers}
          />
        </div>

        {saveError && <p className="text-red-500">{saveError}</p>}
        {feedbackMessage && <p className="text-green-600">{feedbackMessage.text}</p>}

        <Button type="submit" disabled={saveLoading}>
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditEventPage;
