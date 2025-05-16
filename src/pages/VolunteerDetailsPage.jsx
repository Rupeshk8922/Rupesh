import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Adjust the path as needed
import { useauthContext } from '../contexts/authContext'; // Adjust the path and hook name
import { useAuth } from '../contexts/authContext'; // Import useAuth - Normalized import
function VolunteerDetailsPage() {
  const { volunteerId } = useParams(); // Get volunteerId from URL
  const { companyId, userRole } = useAuth(); // Auth context - Corrected hook
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
      await deleteDoc(volunteerDocRef);
      navigate('/dashboard/volunteers'); // Navigate back to the volunteers list
    } catch (err) {
      console.error('Error deleting volunteer:', err);
      setError('Failed to delete volunteer.');
    }

  };

  // Function to navigate to the edit page
  const handleEditClick = () => {
    navigate(`/volunteers/${volunteerId}/edit`);// Mobile Responsiveness: Ensure navigation is clear on small screens.
  }

  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!companyId || !volunteerId) {
        setError('Company ID or Volunteer ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
        const volunteerDocSnap = await getDoc(volunteerDocRef);

        if (volunteerDocSnap.exists()) {
          const volunteerData = volunteerDocSnap.data();
          setVolunteer(volunteerData);
        } else {
          setError('Volunteer not found.');
        }
      } catch (err) {
        console.error('Error fetching volunteer data:', err);
        setError('Failed to fetch volunteer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerData();
  }, [companyId, volunteerId]);


  if (loading) return (
    // Mobile Responsiveness: Loading message should be centered and clear.
    <div className="p-4 text-center">Loading volunteer details...</div>
 );
  if (error) return (
    // Mobile Responsiveness: Error message should be readable and centered.
    <div className="p-4 text-red-600 text-center">Error: {error}</div>
 );

  return (
    // Mobile Responsiveness: p-4 provides basic padding. max-w-lg and mx-auto center the content
    // and limit its width on larger screens, allowing full width on small screens.
 <div className="p-4 max-w-lg mx-auto">
      {/* Mobile Responsiveness: Ensure heading text scales or wraps appropriately. */}
      <h2 className="text-xl font-bold mb-4">Volunteer Details</h2>

      {/* Volunteer details will be displayed here */}
      {volunteer && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Full Name:</h3>
            <p>{volunteer.fullName}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Email:</h3>
            <p>{volunteer.email}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Phone:</h3>
            <p>{volunteer.phone}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Skills/Interests:</h3>
            <p>{volunteer.skillsInterests}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Availability:</h3>
            <p>{volunteer.availability}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Location/City:</h3>
            <p>{volunteer.location}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Preferred Causes:</h3>
            <p>{volunteer.preferredCauses}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Status:</h3>
            <p>{volunteer.status}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notes:</h3>
            <p>{volunteer.notes}</p>
          </div>
        </div>
      )} {/* Mobile Responsiveness: The space-y-4 class on the details div ensures vertical spacing between items. */}

      {/* Action buttons */}
      {/* Mobile Responsiveness: Use flexbox with wrap to ensure buttons stack on small screens if needed.
          Add spacing between buttons. mt-4 provides spacing above the button container. */}
      <div className="mt-6 flex flex-wrap gap-4">
        {userRole && (userRole === 'admin' || userRole === 'Manager' || userRole === 'Outreach Officer') && (
        // Mobile Responsiveness: Ensure button has adequate padding and touch area.
          <button onClick={handleEditClick} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
            Edit Volunteer
          </button>
        )}

        {userRole && (userRole === 'admin' || userRole === 'Manager') && (
          // Mobile Responsiveness: Ensure button has adequate padding and touch area.
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Delete Volunteer {/* Mobile Responsiveness: Ensure button text fits or wraps gracefully. */}
          </button>
        )}
      </div>

    </div>
  );
}