import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { MdDelete } from 'react-icons/md';

const VolunteersList = ({ projectId, volunteers, fetchProjectVolunteers }) => {
  const { user } = useAuth();

  const handleDeleteVolunteer = async (volunteerId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}/volunteers/${volunteerId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Volunteer unassigned successfully!');
        fetchProjectVolunteers(projectId);
      } else {
        const errorData = await response.json(); // Still need errorData to get message
        toast.error(errorData.message || 'Failed to unassign volunteer.');
      }
    } catch {
      toast.error('An error occurred while unassigning the volunteer.'); // The 'error' variable is not used
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4">Assigned Volunteers</h3>

      {/* Remove or uncomment if modal is implemented */}
      {/* <button
        onClick={() => setShowAssignModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
      >
        Assign Volunteer
      </button> */}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {volunteers.map((volunteer) => (
              <tr key={volunteer._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{volunteer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {volunteer.skills?.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteVolunteer(volunteer._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Unassign Volunteer"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default VolunteersList;
