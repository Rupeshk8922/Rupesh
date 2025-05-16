import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/authContext';
import useVolunteers from '../../hooks/useVolunteers.jsx'; 

// Predefined options for filters and roles
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'Manager', // Corrected from 'organizer' based on your usage in 'EditUserPage'
  CSR: 'CSR',
  OUTREACH_OFFICER: 'Outreach Officer',
  VOLUNTEER: 'Volunteer',
};

const AVAILABILITY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends', 'Evenings'];
const INTEREST_OPTIONS = ['Education', 'Health', 'Environment', 'Community Support', 'Fundraising', 'Logistics'];
// TODO: Fetch status options from a central source or configuration
const STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave']; // Added 'On Leave' from EditUserPage

const DEFAULT_INTEREST_ICON = '✨'; // Default icon for interests
const TOP_VOLUNTEER_THRESHOLD = 5; 
import AssignVolunteerModal from '../AssignVolunteerModal'; 
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

const VolunteersList = () => {
  const navigate = useNavigate();
  const { userRole, companyId } = useAuth(); // Get userRole and companyId from useAuth
  const { volunteers, loading, error } = useVolunteers(); // Assuming this hook is correctly implemented

  const [filters, setFilters] = useState({
    availability: [],
    interests: [],
    location: '',
    search: '',
    status: '',
  });
  const [sort, setSort] = useState({
    field: 'name',
    order: 'asc',
  });
  const [currentView, setCurrentView] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [volunteersPerPage] = useState(10); // Number of volunteers per page

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [volunteerToDeleteId, setVolunteerToDeleteId] = useState(null);
  const [volunteerToDeleteName, setVolunteerToDeleteName] = useState('');

  // --- Helper Functions ---
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestIcon = (interest) => {
    // A more useful icon mapping could go here. Example:
    switch (interest) {
      case 'Education': return '📚';
      case 'Health': return '❤️';
      case 'Environment': return '🌳';
      case 'Community Support': return '🤝';
      case 'Fundraising': return '💰';
      case 'Logistics': return '🚚';
      default: return DEFAULT_INTEREST_ICON;
    }
  };

  // --- Handlers ---
  const handleAssignVolunteerToEvent = (volunteerId) => {
    setSelectedVolunteerId(volunteerId);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedVolunteerId(null);
  };

  const handleDeleteClick = (volunteer) => {
    setVolunteerToDeleteId(volunteer.id);
    setVolunteerToDeleteName(volunteer.name);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false); // Close modal immediately on confirm
    if (!volunteerToDeleteId || !companyId) {
      console.error('Error: Missing volunteer ID or company ID for deletion.');
      // You might want to display an error to the user here
      return;
    }
    try {
      const volunteerDocRef = doc(db, 'data', companyId, 'volunteers', volunteerToDeleteId);
      await deleteDoc(volunteerDocRef);
      console.log('Volunteer deleted successfully');
      // No need to refresh, useVolunteers hook should react to Firestore changes
    } catch (err) {
      console.error('Error deleting volunteer:', err);
      // Display error to user, perhaps via a global toast or a local state
    } finally {
      setVolunteerToDeleteId(null);
      setVolunteerToDeleteName('');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    setCurrentPage(1); // Reset to first page on filter change

    setFilters(prevFilters => {
      if (type === 'checkbox') {
        const updatedArray = checked
          ? [...prevFilters[name], value]
          : prevFilters[name].filter(item => item !== value);
        return { ...prevFilters, [name]: updatedArray };
      } else if (type === 'select-multiple') {
        const values = Array.from(options).filter(option => option.selected).map(option => option.value);
        return { ...prevFilters, [name]: values };
      } else {
        return { ...prevFilters, [name]: value };
      }
    });
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSort(prevSort => ({ ...prevSort, [name]: value }));
  };

  // --- Memoized Filter and Sort Logic ---
  const filteredAndSortedVolunteers = useMemo(() => {
    if (!volunteers) return [];

    let filtered = volunteers.filter(volunteer => {
      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.some(av => volunteer.availability?.includes(av))) {
        return false;
      }
      // Interests filter
      if (filters.interests.length > 0 && !filters.interests.some(interest => volunteer.interests?.includes(interest))) {
        return false;
      }
      // Location filter
      if (filters.location && !volunteer.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      // Status filter
      if (filters.status && volunteer.status !== filters.status) {
        return false;
      }
      // Search filter (by name or email)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!volunteer.name?.toLowerCase().includes(searchTerm) && !volunteer.email?.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      const fieldA = a[sort.field] || '';
      const fieldB = b[sort.field] || '';

      if (sort.field === 'joinedAt') {
        // Handle Firestore Timestamp or Date objects
        const dateA = fieldA?.toDate ? fieldA.toDate().getTime() : (fieldA instanceof Date ? fieldA.getTime() : 0);
        const dateB = fieldB?.toDate ? fieldB.toDate().getTime() : (fieldB instanceof Date ? fieldB.getTime() : 0);
        return sort.order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Default string comparison
        if (fieldA < fieldB) return sort.order === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sort.order === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [volunteers, filters, sort]);

  // --- Pagination Logic ---
  const indexOfLastVolunteer = currentPage * volunteersPerPage;
  const indexOfFirstVolunteer = indexOfLastVolunteer - volunteersPerPage;
  const currentVolunteers = filteredAndSortedVolunteers.slice(indexOfFirstVolunteer, indexOfLastVolunteer);
  const totalPages = Math.ceil(filteredAndSortedVolunteers.length / volunteersPerPage);

  // --- Permission Check for Buttons ---
  const canAddEditDeleteAssign = userRole && (
    userRole === ROLES.ADMIN ||
    userRole === ROLES.MANAGER ||
    userRole === ROLES.CSR ||
    userRole === ROLES.OUTREACH_OFFICER
  );

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading volunteers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-red-600">Error loading volunteers: {error.message}</p>
        <button
          onClick={() => navigate('/dashboard')} // Example navigation
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen bg-gray-50'>
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">Volunteer Directory</h2>

      {/* Filter and Sort Controls */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800"><FaFilter className="mr-3 text-blue-600 text-2xl" />Filter & Sort Volunteers</h3>

        {/* Search Bar */}
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><FaSearch className="mr-2 text-gray-500" />Search by Name or Email</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
            placeholder="e.g., John Doe, john.doe@example.com"
          />
        </div>

        {/* Advanced Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Availability Filter */}
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><FaCalendarAlt className="mr-2 text-purple-600" />Availability</label>
            <select
              id="availability"
              name="availability"
              multiple
              value={filters.availability}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base h-28 md:h-24 lg:h-32"
            >
              {AVAILABILITY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Interests Filter */}
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><FaTags className="mr-2 text-green-600" />Interests</label>
            <select
              id="interests"
              name="interests"
              multiple
              value={filters.interests}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-base h-28 md:h-24 lg:h-32"
            >
              {INTEREST_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><FaMapMarkerAlt className="mr-2 text-red-600" />Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-base"
              placeholder="e.g., Nagpur, Delhi"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><FaUsers className="mr-2 text-indigo-600" />Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mt-4">
          <h3 className="text-lg font-semibold flex items-center text-gray-800"><FaSort className="mr-2 text-orange-600" />Sort By:</h3>
          <div className="flex items-center space-x-2">
            <select
              name="field"
              value={sort.field}
              onChange={handleSortChange}
              className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm text-base focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="name">Name</option>
              <option value="joinedAt">Joined Date</option>
              {/* Add more sortable fields if needed, e.g., 'location', 'status' */}
            </select>
            <button
              onClick={() => setSort(prevSort => ({ ...prevSort, order: prevSort.order === 'asc' ? 'desc' : 'asc' }))}
              className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center text-sm font-medium transition duration-150 ease-in-out"
            >
              {sort.order === 'asc' ? <FaSortAlphaDown className="mr-2 text-blue-600 text-lg" /> : <FaSortAlphaUp className="mr-2 text-blue-600 text-lg" />}
              {sort.order === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <button
          onClick={() => setCurrentView(currentView === 'table' ? 'card' : 'table')}
          className="w-full sm:w-auto px-6 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center transition duration-150 ease-in-out text-base"
        >
          {currentView === 'table' ? <FaThLarge className="mr-2" /> : <FaThList className="mr-2" />}
          Switch to {currentView === 'table' ? 'Card View' : 'Table View'}
        </button>

        {canAddEditDeleteAssign && (
          <button
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition duration-150 ease-in-out text-base"
            onClick={() => navigate('/volunteers/add')}
          >
            <FaPlusCircle className="mr-2" /> Add New Volunteer
          </button>
        )}
      </div>

      {/* Volunteer List Display */}
      {!loading && !error && filteredAndSortedVolunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl shadow-md">
          <p className="text-xl text-gray-700 font-semibold mb-4">No volunteers found with the current filters.</p>
          <p className="text-gray-500">Try adjusting your filters or add a new volunteer.</p>
        </div>
      ) : (
        <>
          {currentView === 'table' && (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
              <table className="w-full border-collapse text-left text-gray-700">
                <thead className='bg-gray-100 text-gray-700 uppercase text-sm'>
                  <tr>
                    <th className="p-4 border-b border-gray-200">Name</th>
                    <th className="p-4 border-b border-gray-200">Contact</th>
                    <th className="p-4 border-b border-gray-200 hidden sm:table-cell">Interests</th>
                    <th className="p-4 border-b border-gray-200 hidden md:table-cell">Availability</th>
                    <th className="p-4 border-b border-gray-200">Status</th>
                    <th className="p-4 border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVolunteers.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="p-4 flex items-center text-base font-medium text-gray-800">
                        {volunteer.name}
                        {volunteer.assignedEvents && volunteer.assignedEvents.length >= TOP_VOLUNTEER_THRESHOLD && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Top Volunteer</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{volunteer.email || '-'} / {volunteer.phone || '-'}</td>
                      <td className="p-4 text-sm text-gray-600 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {volunteer.interests?.length > 0 ?
                            volunteer.interests.map(interest => (
                              <span key={interest} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                {interest}
                              </span>
                            )) : '-'
                          }
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {volunteer.availability?.length > 0 ?
                            volunteer.availability.map(av => (
                              <span key={av} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                {av}
                              </span>
                            )) : '-'
                          }
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(volunteer.status)}`}>
                          {volunteer.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4 space-x-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                        {canAddEditDeleteAssign && (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                          <button
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors duration-150"
                            onClick={(e) => { e.stopPropagation(); handleAssignVolunteerToEvent(volunteer.id); }}
                          >
                            Assign
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                          onClick={(e) => { e.stopPropagation(); navigate(`/volunteers/${volunteer.id}`); }}
                        >
                          View
                        </button>
                        {canAddEditDeleteAssign && (
                          <button
                            className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-150"
                            onClick={(e) => { e.stopPropagation(); navigate(`/volunteers/${volunteer.id}/edit`); }}
                          >
                            Edit
                          </button>
                        )}
                        {canAddEditDeleteAssign && (
                          <button
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(volunteer); }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {currentView === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentVolunteers.map(volunteer => (
                <div
                  key={volunteer.id}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/volunteers/${volunteer.id}`)}
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center">
                      {volunteer.name}
                      {volunteer.assignedEvents && volunteer.assignedEvents.length >= TOP_VOLUNTEER_THRESHOLD && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Top Volunteer</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1 flex items-center"><span className="font-semibold mr-1">Email:</span> {volunteer.email || '-'}</p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center"><span className="font-semibold mr-1">Phone:</span> {volunteer.phone || '-'}</p>
                    <p className="text-sm text-gray-600 mb-2 flex items-center"><FaMapMarkerAlt className="mr-2 text-red-500" />{volunteer.location || 'N/A'}</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(volunteer.status)}`}>
                      {volunteer.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Availability:</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {volunteer.availability?.length > 0 ?
                        volunteer.availability.map(av => (
                          <span key={av} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{av}</span>
                        )) : <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">-</span>
                      }
                    </div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Interests:</div>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.interests?.length > 0 ?
                        volunteer.interests.map(interest => (
                          <span key={interest} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center">
                            {getInterestIcon(interest)} {interest}
                          </span>
                        )) : <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">-</span>
                      }
                    </div>
                    <div className="text-sm text-gray-700 mt-3 font-medium">Assigned Events: <span className="font-bold">{volunteer.assignedEvents?.length || 0}</span></div>
                  </div>
                  {canAddEditDeleteAssign && (
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      { (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                        <button
                          className="px-3 py-1 text-purple-600 hover:underline text-sm font-medium"
                          onClick={(e) => { e.stopPropagation(); handleAssignVolunteerToEvent(volunteer.id); }}
                        >
                          Assign
                        </button>
                      )}
                      <button
                        className="px-3 py-1 text-blue-600 hover:underline text-sm font-medium"
                        onClick={(e) => { e.stopPropagation(); navigate(`/volunteers/${volunteer.id}`); }}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 text-green-600 hover:underline text-sm font-medium"
                        onClick={(e) => { e.stopPropagation(); navigate(`/volunteers/${volunteer.id}/edit`); }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-red-600 hover:underline text-sm font-medium"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(volunteer); }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAndSortedVolunteers.length > volunteersPerPage && (
            <div className="mt-8 flex justify-center items-center space-x-3 text-gray-700">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium transition duration-150 ease-in-out"
              >
                Previous
              </button>
              <span className="text-lg font-semibold">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium transition duration-150 ease-in-out"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AssignVolunteerModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        volunteerId={selectedVolunteerId}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={volunteerToDeleteName} // Use itemName for a more generic modal
        itemType="Volunteer" // Specify type of item being deleted
      />
    </div>
  );
};

export default VolunteersList;