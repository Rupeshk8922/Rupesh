import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AuthContext } from '@/contexts/authContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ORGANIZER: 'organizer',
};

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { userRole, companyId } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canEditOrDelete = userRole && [ROLES.ADMIN, ROLES.MANAGER, ROLES.ORGANIZER].includes(userRole.toLowerCase());

  useEffect(() => {
    if (!companyId || !eventId) {
      setError('Missing Company ID or Event ID.');
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const db = getFirestore();
        const eventRef = doc(db, 'data', companyId, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to fetch event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [companyId, eventId]);

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);

    if (!companyId || !eventId) {
      setError('Missing IDs for deletion.');
      return;
    }

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'data', companyId, 'events', eventId));
      navigate('/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/events')}>Go Back</Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 px-4">
        <p className="text-xl text-gray-700">Event not available.</p>
        <Button onClick={() => navigate('/events')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Event Details</h2>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Detail label="Title" value={event.title} />
          <Detail label="Date" value={event.date} />
          <Detail label="Time" value={event.time} />
          <Detail label="Location" value={event.location} />
          <Detail label="Description" value={event.description} preWrap />
          <Detail label="Event Type" value={event.eventType} />
          <Detail label="Max Volunteers" value={event.maxVolunteers} />
        </CardContent>
      </Card>

      {canEditOrDelete && (
        <div className="flex justify-end gap-4">
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            Delete Event
          </Button>
          <Button onClick={() => navigate(`/events/${eventId}/edit`)}>
            Edit Event
          </Button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="Event"
        itemName={event.title || 'this event'}
      />
    </div>
  );
}

// Reusable Detail display
function Detail({ label, value, preWrap = false }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      <p className={`ml-4 text-gray-600 ${preWrap ? 'whitespace-pre-wrap' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}

export default EventDetailsPage;
