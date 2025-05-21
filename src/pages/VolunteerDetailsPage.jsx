import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/authContext';

function VolunteerDetailsPage() {
  const { companyId, userRole } = useAuth();
  const { volunteerId } = useParams();

  const [volunteer, setVolunteer] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!companyId || !volunteerId) {
        setError('Company ID or Volunteer ID is missing.');
        setPageLoading(false);
        return;
      }

      try {
        const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
        const volunteerDocSnap = await getDoc(volunteerDocRef);

        if (volunteerDocSnap.exists()) {
          setVolunteer(volunteerDocSnap.data());
          setError(null);
        } else {
          setError('Volunteer not found.');
        }
      } catch (err) {
        console.error('Error fetching volunteer data:', err);
        setError('Failed to fetch volunteer data.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchVolunteerData();
  }, [companyId, volunteerId]);

  const handleDelete = async () => {
    try {
      const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
      // TODO: After deletion, navigate back to the volunteers list page
      await deleteDoc(volunteerDocRef);
      // navigate('/dashboard/volunteers'); // Uncomment and import useNavigate if needed
    } catch (err) {
      console.error('Error deleting volunteer:', err);
      setError('Failed to delete volunteer.');
    }
  };

  // The handleEditClick function is commented out and not used.
  // Uncomment and implement if needed, and import useNavigate from 'react-router-dom'.

  if (pageLoading) {
    return <div className="p-4 text-center">Loading volunteer details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Volunteer Details</h2>

      {volunteer && (
        <div className="space-y-4">
          <Detail title="Full Name" value={volunteer.fullName} />
          <Detail title="Email" value={volunteer.email} />
          <Detail title="Phone" value={volunteer.phone} />
          <Detail title="Skills/Interests" value={volunteer.skillsInterests} />
          <Detail title="Availability" value={volunteer.availability} />
          <Detail title="Location/City" value={volunteer.location} />
          <Detail title="Preferred Causes" value={volunteer.preferredCauses} />
          <Detail title="Status" value={volunteer.status} />
          <Detail title="Notes" value={volunteer.notes} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        {userRole && ['admin', 'Manager', 'Outreach Officer'].includes(userRole) && (
          <button
            onClick={handleEditClick}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" // Note: handleEditClick is not defined. Implement if needed.
          >
            Edit Volunteer
          </button>
        )}

        {userRole && ['admin', 'Manager'].includes(userRole) && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Volunteer
          </button>
        )}
      </div>
    </div>
  );
}

// Note: The Detail helper component is defined but not used in the rendered output.

export default VolunteerDetailsPage;
