import { useState, useEffect } from 'react';
import { fetchEvents, deleteEvent } from '../../firebase/firebaseFunctions';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
        setEvents(events.filter(event => event.id !== eventToDelete.id));
        setShowDeleteModal(false);
        setEventToDelete(null);
      } catch (err) {
        console.error("Error deleting event:", err);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTagFilterChange = (e) => {
    setFilterTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''));
  };

  const handleLocationFilterChange = (e) => {
    setFilterLocation(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = filterTags.length === 0 || (event.tags && filterTags.every(tag => event.tags.includes(tag)));
      const matchesLocation = filterLocation === '' || (event.location && event.location.toLowerCase().includes(filterLocation.toLowerCase()));
      const matchesStatus = filterStatus === '' || event.status === filterStatus;
      return matchesSearch && matchesTags && matchesLocation && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="events-list p-4">
      <div className="filters flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by tags (comma-separated)"
          onChange={handleTagFilterChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by location"
          onChange={handleLocationFilterChange}
          className="border p-2 rounded"
        />
        <select
          onChange={handleStatusFilterChange}
          value={filterStatus}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button onClick={handleSortToggle} className="bg-blue-500 text-white px-4 py-2 rounded">
          Sort by Name {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <table className="w-full border border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Attendees</th>
              <th className="p-2 border">Tags</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event.id}>
                <td className="p-2 border">{event.name}</td>
                <td className="p-2 border">{event.date}</td>
                <td className="p-2 border">{event.time}</td>
                <td className="p-2 border">{event.location}</td>
                <td className="p-2 border">{event.status}</td>
                <td className="p-2 border">{event.attendees}</td>
                <td className="p-2 border">{(event.tags || []).join(', ')}</td>
                <td className="p-2 border flex gap-2 justify-center">
                  {/* Action buttons */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
};

export default EventsList;
