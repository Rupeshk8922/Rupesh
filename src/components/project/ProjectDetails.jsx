import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import AssignVolunteerModal from '../modals/AssignVolunteerModal';
import axios from 'axios';

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [showAddVolunteerModal, setShowAddVolunteerModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAssignVolunteerModal, setShowAssignVolunteerModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectVolunteers();
    fetchProjectEvents();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const fetchProjectVolunteers = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/volunteers`);
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error fetching project volunteers:', error);
    }
  };

  const fetchProjectEvents = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching project events:', error);
    }
  };

  const handleAddVolunteer = () => {
    setShowAddVolunteerModal(true);
  };

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  };

  const handleAssignVolunteerClick = () => {
    setShowAssignVolunteerModal(true);
  };

  const handleCloseModal = () => {
    setShowAddVolunteerModal(false);
    setShowAddEventModal(false);
    setShowAssignVolunteerModal(false);
    setVolunteerToDelete(null);
    setEventToDelete(null);
    fetchProjectDetails();
    fetchProjectVolunteers();
    fetchProjectEvents();
  };

  const confirmDeleteVolunteer = (volunteerId) => {
    setVolunteerToDelete(volunteerId);
  };

  const confirmDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
  };

  const deleteVolunteer = async () => {
    try {
      await axios.delete(`/api/volunteers/${volunteerToDelete}`);
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    }
  };

  const deleteEvent = async () => {
    try {
      await axios.delete(`/api/events/${eventToDelete}`);
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <p className="text-gray-700 mb-2"><strong>Description:</strong> {project.description}</p>
        <p className="text-gray-700 mb-2"><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
        <p className="text-gray-700 mb-2"><strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}</p>
        <p className="text-gray-700"><strong>Status:</strong> {project.status}</p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setEditingProject(project)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Project
          </button>
          <button
            onClick={() => { /* Add delete project functionality */ }}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaTrash className="mr-2" /> Delete Project
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 flex justify-between items-center">
          Volunteers
          <button
            onClick={handleAddVolunteer}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
>
            <FaPlus className="mr-2" /> Add Volunteer
          </button>
        </h2>
        {volunteers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {volunteers.map((volunteer) => (
              <li key={volunteer._id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{volunteer.name}</p>
                  <p className="text-gray-600">{volunteer.email}</p>
                </div>
                <button
                  onClick={() => confirmDeleteVolunteer(volunteer._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No volunteers assigned yet.</p>
        )}
        <div className="mt-4">
          <button
             onClick={handleAssignVolunteerClick}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
>
            <FaPlus className="mr-2" /> Assign Existing Volunteer
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex justify-between items-center">
          Events
          <button
            onClick={handleAddEvent}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
>
            <FaPlus className="mr-2" /> Add Event
          </button>
        </h2>
        {events.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event._id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{event.name}</p>
                  <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => confirmDeleteEvent(event._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No events scheduled yet.</p>
        )}
      </div>

      {showAddVolunteerModal && (
        <AddVolunteerModal projectId={id} onClose={handleCloseModal} />
      )}

      {showAddEventModal && (
        <AddEventModal projectId={id} onClose={handleCloseModal} />
      )}

      {showAssignVolunteerModal && (
         <AssignVolunteerModal projectId={id} onClose={handleCloseModal}/>
)}

      {editingProject && ( // editingProject is always null based on the state initialization and handleCloseModal
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
            {/* Add your edit project form here */}
            <button
              onClick={() => setEditingProject(null)}
              className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {volunteerToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete Volunteer</h2>
            <p className="mb-4">Are you sure you want to delete this volunteer?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={deleteVolunteer}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setVolunteerToDelete(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

       {eventToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete Event</h2>
            <p className="mb-4">Are you sure you want to delete this event?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={deleteEvent}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setEventToDelete(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;