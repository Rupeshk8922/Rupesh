import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/authContext"; // Corrected import path and hook name
import { db } from '../firebase/config'; // Assuming your db instance is exported

const TrackHoursPage = () => {
  const { volunteerId } = useParams(); // Get volunteerId from URL
  const [volunteer, setVolunteer] = useState(null);
  const [loadingVolunteer, setLoadingVolunteer] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null); // Error state for the form
  const [hoursEntry, setHoursEntry] = useState({ date: "", hours: "", task: "", eventId: "" });
  const { user: currentUser } = useAuth(); // Get the current user from auth context
  const [entries, setEntries] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch volunteer data
 useEffect(() => {
 const fetchVolunteer = async () => {
 try {
 const docRef = doc(db, "volunteers", volunteerId);
 const docSnap = await getDoc(docRef);
 if (docSnap.exists()) {
 setVolunteer({ id: docSnap.id, ...docSnap.data() });
 } else {
 setError("Volunteer not found.");
 }
 } catch (err) {
 console.error("Error fetching volunteer:", err);
 setError("Error fetching volunteer.");
 } finally {
 setLoadingVolunteer(false);
 }
 };

 fetchVolunteer();
 }, [volunteerId]);

  // Fetch existing entries
 useEffect(() => {
 const fetchEntries = async () => {
 try {
 const q = query(
 collection(db, "volunteerHours"),
 where("volunteerId", "==", volunteerId)
 );
 const snapshot = await getDocs(q);
 const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 setEntries(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
 } catch (err) {
 console.error("Error fetching entries:", err);
 }
 };

 fetchEntries();
 }, [volunteerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
 setHoursEntry((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { date, hours, task } = hoursEntry;
 if (!date || !hours || !task) {
 setError("All fields are required.");
 return false;
 }
 if (isNaN(hours) || Number(hours) <= 0) {
 setError("Hours must be a valid number greater than 0.");
 return false;
 }
 return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
 setError(null); // Clear previous errors
    setSuccessMessage("");

 if (!validateForm()) return;

    setLoadingSubmit(true);
    try {
      await addDoc(collection(db, 'volunteerHours'), { // Corrected typo in collection name if necessary
 ...hoursEntry,
 hours: Number(hoursEntry.hours),
 volunteerId,
 volunteerName: volunteer?.name || "",
 createdBy: currentUser?.uid || "",
 companyId: currentUser?.companyId || "", // Add companyId here
        createdAt: serverTimestamp(),
 approved: false,
      });

      setSuccessMessage("Hours logged successfully!"); // Corrected typo
 setHoursEntry({ date: "", hours: "", task: "", eventId: "" });
      
      // Refresh entries list
 const q = query(collection(db, "volunteerHours"), where("volunteerId", "==", volunteerId));
 const snapshot = await getDocs(q);
 const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 setEntries(list.sort((a, b) => new Date(b.date) - new Date(a.date)));

    } catch (err) {
 console.error("Error saving entry:", err);
 setError("Failed to log hours.");
    } finally {
 setLoadingSubmit(false);
    }
  };

  if (loadingVolunteer) { // Changed loading check
    return <p className="p-4">Loading volunteer details...</p>;
  }

 if (error && !volunteer) return <p className="text-red-600 p-4">{error}</p>; // Corrected error display
 if (!volunteer) return <p className="p-4">Volunteer not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Track Hours for {volunteer.name}</h1>

      {/* Form to Add Hours Entry */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
               {/* Optional: Event Selection */}
        {/* <div>
          <label className="block text-sm font-medium">Event (optional)</label>
                   <select
 name="eventId"
 value={hoursEntry.eventId}
 onChange={handleChange}
 className="w-full border p-2 rounded"
 >
 <option value="">Select Event</option>
 <option value="event123">Event 1</option>
 <option value="event456">Event 2</option>
 </select>
 </div> */}

              <div>
                  <label className="block text-sm font-medium">Date</label>
                  <input
                      type="date"
                      name="date"
                      value={hoursEntry.date}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium">Hours</label>
                  <input
                      type="number"
                      name="hours"
                      value={hoursEntry.hours}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      min="0"
                      step="0.1"
                      required
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium">Task</label>
                  <textarea
                      name="task"
                      value={hoursEntry.task}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      rows="3"
                      required
                  ></textarea>
              </div>

              {error && <p className="text-red-600">{error}</p>}
              {successMessage && <p className="text-green-600">{successMessage}</p>}

              <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={loadingSubmit}
              >
                  {loadingSubmit ? "Saving..." : "Log Hours"}
              </button>
          </form>

      {/* Existing Entries */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Hours Logged</h2>
        {entries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.id} className="border p-3 rounded shadow-sm">
                <p><strong>Date:</strong> {entry.date}</p>
                <p><strong>Hours:</strong> {entry.hours}</p>
                <p><strong>Task:</strong> {entry.task}</p>
                <p className="text-sm text-gray-500">
                  {entry.approved ? "✅ Approved" : "⏳ Pending Approval"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TrackHoursPage;