import { useState, useEffect } from "react";
import Modal from "react-modal";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/authContext.jsx";
import { useSubscriptionType } from "../hooks/useSubscription.jsx";
// Set app element for accessibility
Modal.setAppElement('#root');

const AssignVolunteerModal = ({ isOpen, onClose, volunteerId }) => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const { user: currentUser } = useAuth(); // Using the correct authContext
  const subscription = useSubscriptionType(); // Using SubscriptionContext

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const eventsRef = collection(db, "events");
        // Assuming events are also associated with a company
        const q = query(eventsRef, where("companyId", "==", currentUser.uid)); // You might need to get companyId from the user context if it\'s not the same as currentUser.uid
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
      } catch (err) {
        setError("Failed to fetch events: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && currentUser) {
      fetchEvents();
    }
  }, [isOpen, currentUser]);

  const handleAssign = async () => {
    if (!selectedEventId || !volunteerId) return;
    setIsAssigning(true);
    setError(null);

    try {
      const volunteerRef = doc(db, "volunteers", volunteerId);
       const eventDoc = await getDoc(doc(db, "events", selectedEventId));
       const eventName = eventDoc.exists() ? eventDoc.data().name : "Unknown Event";

      await updateDoc(volunteerRef, {
        assignedEvent: selectedEventId,
        assignedEventName: eventName, // Store event name for easier display
      });
      onClose(); // Close modal on success
    } catch (err) {
      setError("Failed to assign volunteer to event: " + err.message);
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Assign Volunteer Modal"
    >
      <h2 className="text-xl font-bold mb-4">Assign Volunteer to Event</h2>
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && events.length > 0 && (
        <div className="mb-4">
          <label htmlFor="event-select" className="block text-sm font-medium text-gray-700">
            Select Event:
          </label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">-- Select --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      )}
       {!loading && !error && events.length === 0 && (
           <p>No events available to assign volunteers to.</p>
       )}


      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
        >
          Cancel
        </button>
        <button
          onClick={handleAssign}
          disabled={!selectedEventId || isAssigning}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${(!selectedEventId || isAssigning) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isAssigning ? "Assigning..." : "Assign"}
        </button>
      </div>
    </Modal>
  );
};

export default AssignVolunteerModal;