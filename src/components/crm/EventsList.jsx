import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEvents from '../../hooks/useEvents.jsx';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';import { FaCircle, FaSquare } from 'react-icons/fa';
import { db } from '../../firebase/config';

import { useAuth } from '../../hooks/useAuth';import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
const EventsList = () => {
 const { companyId, user, userRole } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const ROLES = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
  };
  const [filterDateRange, setFilterDateRange] = useState('all'); // Add state for filterDateRange
  const [filterLocation, setFilterLocation] = useState('');
  const [filterVolunteerCapacity, setFilterVolunteerCapacity] = useState('');
  const [filterType, setFilterType] = useState(''); // Initialize filterType state
  const { events, loading, error } = useEvents();
  const navigate = useNavigate();
  const [eventToDeleteId, setEventToDeleteId] = useState(null);
  const [eventToDeleteTitle, setEventToDeleteTitle] = useState('');

  const [currentView, setCurrentView] = useState('table');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleDeleteClick = (event) => {
    setEventToDeleteId(event.id);
    setEventToDeleteTitle(event.title);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDeleteId || !companyId) return;
    try { // Corrected the comment formatting
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

  const filteredAndSortedEvents = events
    ? events
      .filter((event) => {

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

        if (filterLocation && !event.location.toLowerCase().includes(filterLocation.toLowerCase())) {
          return false;
        }
        if (filterVolunteerCapacity && filterVolunteerCapacity !== 'all') {
          const value = parseInt(filterVolunteerCapacity.substring(1), 10);

          if (isNaN(value)) {
            return true;
          }

          const operator = filterVolunteerCapacity.substring(0, 1);
          const assignedCount = event.assignedVolunteers ? event.assignedVolunteers.length : 0;
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
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date); // Corrected the comment formatting
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      })
    : [];

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'Webinar':
 return <FaCircle className="mr-2 text-blue-500" />;
      case 'Awareness Campaign':
 return <FaSquare className="mr-2 text-orange-500" />; // Using FaSquare for Awareness Campaign
      case 'Fundraiser': // Added Fundraiser type
 return <FaSquare className="mr-2 text-purple-500" />; // Example icon for Fundraiser
      default:
        return <MdOutlineEventNote className="mr-2 text-gray-500" />;
    }
  };

  const eventTypes = ["Webinar", "Fundraiser", "Awareness Campaign"];

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedEvents.length / eventsPerPage));


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Events</h2>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Filter & Sort</h3>
        </div>
        <div className="flex justify-end mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 flex-wrap md:flex-nowrap">
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 flex-wrap md:flex-nowrap">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Filter by Location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 flex-wrap md:flex-nowrap">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Filter by Volunteers (e.g., >5, <10, =3)" // Corrected the comment formatting
                  title="Enter operator (> < =) followed by a number (e.g., >5)"
                  pattern="[><=]\d+"
                  value={filterVolunteerCapacity}
                  onChange={(e) => setFilterVolunteerCapacity(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded ${currentView === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  onClick={() => setCurrentView('table')}
                >
                  Table View
                </button>
                <div className="flex items-center space-x-2">
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={'date'}
                    onChange={() => { /* setSortBy(e.target.value); */ setCurrentPage(1); }}
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                    <option value="volunteers">Volunteers</option>
                  </select>
                </div>
                <button
                 className={`px-4 py-2 rounded ${currentView === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                 onClick={() => setCurrentView('card')}
               >Card View</button>
              </div>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                >
                  <option value="asc">
                    {'Ascending (Oldest First)'}
                  </option>
                  <option value="desc">
                    {'Descending (Newest First)'}
                  </option>
                </select>
          </div>

          {loading && <p>Loading events...</p>}
          {error && (
            <div className="text-red-500 mb-4">
              Error loading events: {error.message}
            </div>
          )}


          {!loading && !error && (filteredAndSortedEvents.length === 0 ? (
            <p>No events found. Add your first event!</p>
          ) : currentView === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Location</th>
                    <th className="py-3 px-6 text-left">Type</th> {/* Added Type header */}
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredAndSortedEvents.slice(
                    (currentPage - 1) * eventsPerPage,
                    currentPage * eventsPerPage).map((event) => (
                      <tr
                        key={event.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out ${event.status === 'Completed' ? 'bg-green-50' : ''}`}
                        onClick={() => navigate('/events/' + event.id)}>
                        <td className="py-3 px-6 text-left">{event.title}</td> {/* Display Title */}
                        <td className="py-3 px-6 text-left">{event.date}</td>
                        <td className="py-3 px-6 text-left">{event.location}</td>
                        {/* Corrected the misplaced backslash in the className below */}
                        <td className="py-3 px-6 text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          {userRole && (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER || (event.assignedTo === user?.uid)) && event.status !== 'Completed' && event.status !== 'Canceled' && (
                             <button
                              className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkCompleted(event.id);
                              }}
                            >
                              Mark as Completed
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => navigate('/events/' + event.id)}>
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-800 font-medium" onClick={(e) => { e.stopPropagation(); navigate('/events/' + event.id + '/edit'); }}>
                            Edit
                          </button>
                          {(userRole === ROLES.ADMIN || userRole === ROLES.ORGANIZER) && (
                            <button className="text-red-600 hover:text-red-800 font-medium" onClick={(e) => { e.stopPropagation(); handleDeleteClick(event); }}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : ( /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedEvents.slice(
                (currentPage - 1) * eventsPerPage,
                currentPage * eventsPerPage
              ).map((event) => (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg shadow p-6 border-t-4 ${event.status === 'Completed' ? 'border-green-500' : event.status === 'Canceled' ? 'border-red-500' : 'border-blue-500'} cursor-pointer hover:shadow-md transition duration-150 ease-in-out`}
                  onClick={() => navigate('/events/' + event.id)}
                >
                  <h3 className="text-lg font-semibold mb-2 flex items-center">{getEventTypeIcon(event.eventType)} {event.title}</h3>
                  <p className="text-gray-600 text-sm mb-1 flex items-center"><FaCalendarAlt className="mr-2" /> {event.date}</p>
                  <p className="text-gray-600 text-sm mb-2 flex items-center">{getEventTypeIcon(event.eventType)} {event.eventType}</p>

                  <div className="flex justify-end space-x-2 mt-2">
                    {userRole && (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER || (event.assignedTo === user?.uid)) && event.status !== 'Completed' && event.status !== 'Canceled' && (
                      <button
                        className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                        onClick={(e) => { e.stopPropagation(); handleMarkCompleted(event.id); }}
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm" onClick={(e) => { e.stopPropagation(); navigate('/events/' + event.id); }}>View</button>
                    <button className="text-green-600 hover:text-green-800 font-medium text-sm" onClick={(e) => { e.stopPropagation(); navigate('/events/' + event.id + '/edit'); }}>Edit</button>
                    {(userRole === ROLES.ADMIN || userRole === ROLES.ORGANIZER) && (
                      <button className="text-red-600 hover:text-red-800 font-medium text-sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(event); }}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

 {userRole && (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER || userRole === ROLES.CSR || userRole === ROLES.OUTREACH_OFFICER) && (
 <div className="mt-6 flex justify-center">
 </div>
          )}

          {!loading && !error && filteredAndSortedEvents.length > eventsPerPage && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAndSortedEvents.length / eventsPerPage)))}
                disabled={currentPage === Math.ceil(filteredAndSortedEvents.length / eventsPerPage)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={eventToDeleteTitle}
      />
    </div>
  );
}

export default EventsList;