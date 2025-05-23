import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; // hypothetical auth hook

const EventsModule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { role } = useAuth(); // user info + role from context or your auth solution
  const db = getFirestore();

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const eventsCol = collection(db, "events");
        const eventSnapshot = await getDocs(eventsCol);
        const eventList = eventSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventList);
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      }
      setLoading(false);
    }

    fetchEvents();
  }, [db]);

  if (loading) return <p className="text-gray-500">Loading events...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold mb-4">Events</h3>

      {events.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <ul className="space-y-4">
          {events.map(event => (
            <li
              key={event.id}
              className="border rounded p-4 flex justify-between items-center shadow-sm"
            >
              <div>
                <h4 className="text-lg font-bold">{event.title || "Untitled Event"}</h4>
                <p className="text-sm text-gray-600">
                  Date: {event.date ? new Date(event.date.seconds * 1000).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-gray-500">Status: {event.status || "Pending"}</p>
              </div>

              {/* Show Edit/Delete buttons if user has admin or manager role */}
              {(role === "admin" || role === "manager") && (
                <div className="space-x-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    onClick={() => alert(`Edit event ${event.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    onClick={() => alert(`Delete event ${event.id}`)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsModule;
