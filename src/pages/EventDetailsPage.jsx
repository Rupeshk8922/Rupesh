import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { AuthContext } from '../contexts/authContext';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'; // Ensure this file exists

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { userRole, companyId } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ORGANIZER: 'organizer',
  };

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);

      if (!companyId || !eventId) {
        setError('Company ID or Event ID is missing. Cannot fetch event details.');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const eventDocRef = doc(db, 'data', companyId, 'events', eventId);
        const eventDocSnap = await getDoc(eventDocRef);

        if (eventDocSnap.exists()) {
          setEvent({ id: eventDocSnap.id, ...eventDocSnap.data() });
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to fetch event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [companyId, eventId]);

  const handleDeleteClick = () => setIsDeleteModalOpen(true);

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);

    if (!companyId || !eventId) {
      setError('Missing Company ID or Event ID for deletion.');
      return;
    }

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'data', companyId, 'events', eventId));
      console.log('Event deleted successfully');
      navigate('/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  const handleDeleteCancel = () => setIsDeleteModalOpen(false);

  const canEditOrDelete =
    userRole &&
    [ROLES.ADMIN, ROLES.MANAGER, ROLES.ORGANIZER].includes(userRole.toLowerCase());

  // --- Render states ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <p className="text-xl text-red-600">Error: {error}</p>
        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Events List
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <p className="text-xl text-gray-700">Event data is not available.</p>
        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Events List
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Event Details</h2>

      <div className="space-y-4 text-gray-700">
        <Detail label="Title" value={event.title} />
        <Detail label="Date" value={event.date} />
        <Detail label="Time" value={event.time} />
        <Detail label="Location" value={event.location} />
        <Detail label="Description" value={event.description} preWrap />
        <Detail label="Event Type" value={event.eventType} />
        <Detail label="Max Volunteers" value={event.maxVolunteers} />
      </div>

      {canEditOrDelete && (
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleDeleteClick}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            Delete Event
          </button>
          <button
            onClick={() => navigate(`/events/${eventId}/edit`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Edit Event
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="Event"
        itemName={event?.title || 'this event'}
      />
    </>
  );
}

// --- Reusable Detail component ---
function Detail({ label, value, preWrap = false }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800">{label}:</h3>
      <p className={`ml-4 text-gray-600 ${preWrap ? 'whitespace-pre-wrap' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}

export default EventDetailsPage;
