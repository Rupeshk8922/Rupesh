import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/firebase/config.jsx';
export default function OutreachContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContact() {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "outreachContacts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContact(docSnap.data());
        } else {
          setError("Contact not found.");
        }
      } catch (err) {
        setError("Failed to load contact details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchContact();
    } else {
      setError("No contact ID specified.");
      setLoading(false);
    }
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading contact details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen px-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Outreach Contact Details</h1>

      <div className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Name:</h2>
          <p>{contact.name || "N/A"}</p>
        </div>
        <div>
          <h2 className="font-semibold text-lg">Email:</h2>
          <p>{contact.email || "N/A"}</p>
        </div>
        <div>
          <h2 className="font-semibold text-lg">Mobile:</h2>
          <p>{contact.mobile || "N/A"}</p>
        </div>
        <div>
          <h2 className="font-semibold text-lg">Role / Position:</h2>
          <p>{contact.role || "N/A"}</p>
        </div>
        <div>
          <h2 className="font-semibold text-lg">Notes:</h2>
          <p>{contact.notes || "N/A"}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back
      </button>
    </div>
  );
}
