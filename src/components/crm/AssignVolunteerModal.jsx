import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Import your Firestore instance

const AssignVolunteerModal = ({ isOpen, onClose, volunteerId }) => {
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(false); // State for success message

  useEffect(() => {
    if (isOpen) {
      const fetchAvailableEvents = async () => {
        setLoading(true);
        setError(null);
        try {
          const eventsCollectionRef = collection(db, 'events');
          // Fetch events that are not completed, you might add other filters
          const q = query(eventsCollectionRef, where('status', '!=', 'completed'));
          const querySnapshot = await getDocs(q);
          const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAvailableEvents(eventsList);
        } catch (err) {
          setError('Failed to fetch available events.');
          console.error('Error fetching available events:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchAvailableEvents();
      // Reset selected event and messages when modal opens
      setSelectedEventId('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]); // Fetch events when the modal opens

  const handleAssignButtonClick = async () => {
    if (!selectedEventId) {
      setError('Please select an event to assign.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update the volunteer document to assign the event
      const volunteerDocRef = doc(db, 'volunteers', volunteerId);
      await updateDoc(volunteerDocRef, {
        assignedEvent: selectedEventId,
        // You might want to add other fields here, like assignedAt, etc.
      });

      // Alternatively, update the event document to add the volunteer
      // import { arrayUnion } from 'firebase/firestore';
      // const eventDocRef = doc(db, 'events', selectedEventId);
      // await updateDoc(eventDocRef, {
      //   assignedVolunteers: arrayUnion(volunteerId)
      // });


      setSuccess(true);
      // Optionally close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to assign volunteer to event.');
      console.error('Error assigning volunteer to event:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Assign Volunteer to Event</h2>
        <p>Assigning Volunteer ID: {volunteerId}</p>

        <div className="my-4">
          <p>Select an event to assign this volunteer to:</p>
          {loading && <p>Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Event --</option>
              {availableEvents.map(event => (
                <option key={event.id} value={event.id}>{event.name || event.title}</option> // Display name or title
              ))}
            </select>
          )}
        </div>

        {success && <p className="text-green-500 mb-4">Volunteer assigned successfully!</p>}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 rounded border" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleAssignButtonClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!selectedEventId || loading}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignVolunteerModal;
