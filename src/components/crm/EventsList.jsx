import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEvents from '../../hooks/useEvents.jsx';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaCircle, FaSquare } from 'react-icons/fa';
import { MdOutlineEventNote } from 'react-icons/md';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';

const EventsList = () => {
  const { companyId, userRole } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState(null);
  const [eventToDeleteTitle, setEventToDeleteTitle] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterVolunteerCapacity, setFilterVolunteerCapacity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentView, setCurrentView] = useState('table');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const { events, loading, error } = useEvents();
  const navigate = useNavigate();

  const ROLES = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    MANAGER: 'manager',
  };

  const eventsPerPage = 8;

  const handleMarkCompleted = async (eventId) => {
    if (!companyId) return;

    try {
      const eventDocRef = doc(db, 'data', companyId, 'events', eventId);
      await updateDoc(eventDocRef, {
        status: 'Completed',
        completedAt: new Date(),
      });
      console.log('Event marked as completed:', eventId);
    } catch (error) {
      console.error('Error marking event as completed:', error);
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDeleteId(event.id);
    setEventToDeleteTitle(event.title);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDeleteId || !companyId) return;

    try {
      const eventDocRef = doc(db, 'data', companyId, 'events', eventToDeleteId);
      await deleteDoc(eventDocRef);
      console.log('Event deleted successfully:', eventToDeleteId);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setEventToDeleteId(null);
      setEventToDeleteTitle('');
    }
  };

  const eventTypes = ['Webinar', 'Fundraiser', 'Awareness Campaign'];

  const filteredAndSortedEvents = events
    ? events
        .filter((event) => {
          // Filter by Date Range
          if (filterDateRange !== 'all') {
            const eventDate = new Date(event.date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (filterDateRange === 'upcoming' && eventDate < now) {
              return false;
            }
            if (filterDateRange === 'past' && eventDate >= now) {
              return false;
            }
          }

          // Filter by Location
          if (
            filterLocation &&
            !event.location.toLowerCase().includes(filterLocation.toLowerCase())
          ) {
            return false;
          }

          // Filter by Volunteer Capacity
          if (filterVolunteerCapacity && filterVolunteerCapacity !== 'all') {
            const value = parseInt(filterVolunteerCapacity.substring(1), 10);
            if (Number.isNaN(value)) return true;

            const operator = filterVolunteerCapacity.substring(0, 1);
            const assignedCount = event.assignedVolunteers
              ? event.assignedVolunteers.length
              : 0;

            switch (operator) {
              case '>':
                if (assignedCount <= value) return false;
                break;
              case '<':
                if (assignedCount >= value) return false;
                break;
              case '=':
                if (assignedCount !== value) return false;
                break;
              default:
                return true;
            }
          }

          // Filter by Event Type
          if (filterType && filterType !== '' && event.eventType !== filterType) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        })
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedEvents.length / eventsPerPage));

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Icon helper for event type
  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'Webinar':
        return <FaCircle className="mr-2 text-blue-500" />;
      case 'Awareness Campaign':
        return <FaSquare className="mr-2 text-orange-500" />;
      case 'Fundraiser':
        return <FaSquare className="mr-2 text-purple-500" />;
      default:
        return <MdOutlineEventNote className="mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Events</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Filter & Sort</h3>
        </div>

        <div className="flex flex-wrap justify-between mb-4 gap-4">
          {/* Filters */}
          <select
            className="border px-3 py-2 rounded w-48"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded w-48"
            value={filterDateRange}
            onChange={(e) => {
              setFilterDateRange(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <input
            type="text"
            className="border px-3 py-2 rounded w-48"
            placeholder="Filter by Location"
            value={filterLocation}
            onChange={(e) => {
              setFilterLocation(e.target.value);
              setCurrentPage(1);
            }}
          />

          <input
            type="text"
            className="border px-3 py-2 rounded w-48"
            placeholder="Filter by Volunteers (e.g., >5, <10, =3)"
            title="Enter operator (> < =) followed by a number (e.g., >5)"
            pattern="[><=]\d+"
            value={filterVolunteerCapacity}
            onChange={(e) => {
              setFilterVolunteerCapacity(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* View and Sorting */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex space-x-2">
            <button
              type="button"
              className={`px-4 py-2 rounded ${
                currentView === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setCurrentView('table')}
            >
              Table View
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded ${
                currentView === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setCurrentView('card')}
            >
              Card View
            </button>
          </div>

          <select
            className="border px-3 py-2 rounded w-48"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="asc">Ascending (Oldest First)</option>
            <option value="desc">Descending (Newest First)</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-600">Error: {error.message || error}</p>}

      {!loading && !error && filteredAndSortedEvents.length === 0 && (
        <p className="text-gray-600">No events found for the selected filters.</p>
      )}

      {!loading && !error && filteredAndSortedEvents.length > 0 && (
        <>
          {currentView === 'table' && (
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow mb-6">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Volunteers Assigned</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEvents
                  .slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)
                  .map((event) => (
                    <tr
                      key={event.id}
                      className="border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate(`/dashboard/crm/events/${event.id}`)}
                    >
                      <td className="py-3 px-4 flex items-center">
                        {getEventTypeIcon(event.eventType)}
                        {event.title}
                      </td>
                      <td className="py-3 px-4">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{event.time}</td>
                      <td className="py-3 px-4">{event.location}</td>
                      <td className="py-3 px-4">
                        {event.assignedVolunteers ? event.assignedVolunteers.length : 0}
                      </td>
                      <td className="py-3 px-4">{event.status || 'Scheduled'}</td>
                      <td className="py-3 px-4 space-x-2">
                        {(userRole === ROLES.ADMIN || userRole === ROLES.ORGANIZER) && (
                          <>
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/crm/events/edit/${event.id}`);
                              }}
                              aria-label={`Edit event ${event.title}`}
                              title="Edit Event"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(event);
                              }}
                              aria-label={`Delete event ${event.title}`}
                              title="Delete Event"
                            >
                              Delete
                            </button>
                            {event.status !== 'Completed' && (
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkCompleted(event.id);
                                }}
                                aria-label={`Mark event ${event.title} as completed`}
                                title="Mark as Completed"
                              >
                                Complete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {currentView === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents
                .slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)
                .map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer flex flex-col justify-between"
                    onClick={() => navigate(`/dashboard/crm/events/${event.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/dashboard/crm/events/${event.id}`);
                      }
                    }}
                    aria-label={`View details for event ${event.title}`}
                  >
                    <div className="flex items-center mb-2">
                      {getEventTypeIcon(event.eventType)}
                      <h4 className="text-lg font-semibold">{event.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Date: {new Date(event.date).toLocaleDateString()} {event.time}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">Location: {event.location}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      Volunteers Assigned: {event.assignedVolunteers?.length || 0}
                    </p>
                    <p className="text-sm font-medium mb-3">Status: {event.status || 'Scheduled'}</p>

                    {(userRole === ROLES.ADMIN || userRole === ROLES.ORGANIZER) && (
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/crm/events/edit/${event.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Edit event ${event.title}`}
                          title="Edit Event"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(event);
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete event ${event.title}`}
                          title="Delete Event"
                        >
                          Delete
                        </button>
                        {event.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkCompleted(event.id);
                            }}
                            className="text-green-600 hover:text-green-800"
                            aria-label={`Mark event ${event.title} as completed`}
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white'
              }`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete the event "${eventToDeleteTitle}"?`}
      />
    </div>
  );
};

export default EventsList;
