import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, getFirestore } from 'firebase/firestore'; // Import getFirestore here
import { useauthContext } from '../contexts/authContext'; // Adjust the path as needed
// Import a confirmation modal for better UX than window.confirm
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'; // Assuming you have a ConfirmDeleteModal component
import { useAuth } from '../contexts/authContext';
function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, userRole, companyId } = useauthContext(); // Destructure userRole and companyId directly
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define roles for permission checks
  const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'Manager',
    ORGANIZER: 'organizer', // Assuming 'organizer' can also delete/edit based on your other components
  };

  useEffect(() => {
    const fetchEventData = async () => {
      // Ensure we have necessary IDs and user before attempting to fetch
      if (!companyId || !eventId) {
        setError('Company ID or Event ID is missing. Cannot fetch event details.');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore(); // Get the Firestore instance here
        // Correct Firestore path: 'data' collection -> 'companyId' document -> 'events' subcollection -> 'eventId' document
        const eventDocRef = doc(db, 'data', companyId, 'events', eventId);
        const eventDocSnap = await getDoc(eventDocRef);

        if (eventDocSnap.exists()) {
          setEvent({ id: eventDocSnap.id, ...eventDocSnap.data() }); // Include ID in the event object
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

    // Only fetch if companyId and eventId are available (which they should be once user loads)
    if (companyId && eventId) {
      fetchEventData();
    }
  }, [companyId, eventId]); // Depend on companyId and eventId

  // --- Delete Logic ---
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false); // Close the modal
    if (!companyId || !eventId) {
      setError('Missing Company ID or Event ID for deletion.');
      return;
    }

    try {
      const db = getFirestore(); // Get the Firestore instance here for deletion
      // Ensure the correct Firestore path for deletion
      await deleteDoc(doc(db, 'data', companyId, 'events', eventId));
      console.log('Event deleted successfully');
      navigate('/events'); // Navigate to the events list page
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  // --- Permission Checks ---
  // Determine if the current user has permission to edit/delete the event
  const canEditOrDelete = userRole && (
    userRole === ROLES.ADMIN ||
    userRole === ROLES.MANAGER ||
    userRole === ROLES.ORGANIZER // Assuming event organizers can edit/delete their events
    // You might also add: || (event && event.createdBy === user.uid) if events have a 'createdBy' field
  );

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-red-600">Error: {error}</p>
        <button
          onClick={() => navigate('/events')}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Events List
        </button>
      </div>
    );
  }

  if (!event) {
    // This case should ideally be caught by the error state if event is not found,
    // but as a fallback or if initial fetch succeeded but event data is null for some reason.
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Event data is not available.</p>
        <button
          onClick={() => navigate('/events')}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Events List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md my-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Event Details</h2>

      <div className="space-y-4 text-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Title:</h3>
          <p className="ml-4 text-gray-600">{event.title}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Date:</h3>
          <p className="ml-4 text-gray-600">{event.date}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Time:</h3>
          <p className="ml-4 text-gray-600">{event.time}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Location:</h3>
          <p className="ml-4 text-gray-600">{event.location}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Description:</h3>
          <p className="ml-4 text-gray-600 whitespace-pre-wrap">{event.description}</p> {/* Use whitespace-pre-wrap for multi-line descriptions */}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Event Type:</h3>
          <p className="ml-4 text-gray-600">{event.eventType}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Max Volunteers:</h3>
          <p className="ml-4 text-gray-600">{event.maxVolunteers}</p>
        </div>
        {/* Add more event details here as needed */}
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
        itemType="Event" // Pass the type of item being deleted for generic modal
        itemName={event?.title || 'this event'} // Pass the event title for a user-friendly message
      />
    </div>
  );
}

export default EventDetailsPage;