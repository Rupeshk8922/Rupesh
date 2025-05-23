import { useNavigate } from 'react-router-dom';

const EventNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Event Not Found</h1>
      <p className="text-gray-600">Sorry, the event you are looking for does not exist or has been removed.</p>
      <button
        onClick={() => navigate(-1)} // Navigate back to previous page
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Back
      </button>
      <button
        onClick={() => navigate('/events')} // Navigate to events list page
        className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
      >
        Browse Events
      </button>
    </div>
  );
};

export default EventNotFound;
