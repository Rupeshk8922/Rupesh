import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Adjust import path if needed
// import EventsList from '../../components/crm/EventsList.jsx'; // Adjust import path if needed
import LoadingSpinner from '@/components/LoadingSpinner';

const EventsPage = () => {
  const { companyId, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading || !companyId) {
    return <LoadingSpinner />;
  }

  const handleAddNewEvent = () => {
    navigate('/dashboard/crm/events/create');
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">All Events</h2>
        <button
          onClick={handleAddNewEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Add New Event"
        >
          + Add New Event
        </button>
      </div>
      {/* Temporarily commented out due to build issue */}
      {/* <EventsList companyId={companyId} /> */}
    </div>
  );
};

export default EventsPage;
