import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useLeads from '../../hooks/useLeads';
import { useauthContext } from '../../contexts/authContext';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { db } from '../../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';

const LeadsList = () => {

 const { user, userRole, companyId } = useauthContext(); // Get userRole and companyId from useauthContext
  const { leads, loading, error } = useLeads();

  const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    VOLUNTEER: 'volunteer',
    CSR: 'csr',
    OUTREACH_OFFICER: 'outreach officer',
  };

  const navigate = useNavigate();

  // Filters, search
  const [interestFilter, setInterestFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  // View toggle
  const [isCardView, setIsCardView] = useState(false);

  // Options
  const interestOptions = ['', 'Event', 'Volunteer', 'Donation', 'General Inquiry'];
  const statusOptions = ['', 'New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

  // Assign Lead modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Delete Lead modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDeleteId, setLeadToDeleteId] = useState(null);
  const [leadToDeleteName, setLeadToDeleteName] = useState('');

  // Handle lead assignment modal open
  const handleAssignLead = (leadId) => {
    setSelectedLeadId(leadId);
    setIsAssignModalOpen(true);
  };

  // Handle delete lead confirmation
  const handleDeleteLead = async () => {
    if (!leadToDeleteId) return;

    try {
      await deleteDoc(doc(db, 'leads', leadToDeleteId));
      setIsDeleteModalOpen(false);
      setLeadToDeleteId(null);
      setLeadToDeleteName('');
      // Optionally, trigger refetch or update local state after deletion
    } catch (err) {
      console.error('Failed to delete lead:', err);
      // Optionally show error notification
    }
  };

  // Filter, search, sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filteredLeads = leads || [];

    if (interestFilter) {
      filteredLeads = filteredLeads.filter(lead => lead.interest === interestFilter);
    }
    if (statusFilter) {
      filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
    }
    if (searchQuery) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    const sortedLeads = [...filteredLeads].sort((a, b) => {
      const aValue = a[sortCriteria] || '';
      const bValue = b[sortCriteria] || '';

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedLeads;
  }, [leads, interestFilter, statusFilter, searchQuery, sortCriteria, sortOrder]);

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredAndSortedLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredAndSortedLeads.length / leadsPerPage);

  // Pagination change handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Sort toggle handler
  const handleSortChange = (criteria) => {
    if (criteria === sortCriteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Leads</h2>

      {loading && <p>Loading leads...</p>}
      {error && <p className="text-red-600">Error loading leads: {error.message}</p>}

      {/* Filters and Search */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label htmlFor="interestFilter" className="block text-sm font-medium text-gray-700">Interest</label>
          <select
            id="interestFilter"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={interestFilter}
            onChange={(e) => {
              setInterestFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {interestOptions.map(option => (
              <option key={option} value={option}>
                {option === '' ? 'All Interests' : option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="statusFilter"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option === '' ? 'All Statuses' : option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-grow min-w-[200px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search (Name, Company)</label>
          <input
            type="text"
            id="search"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="mb-4 flex items-center space-x-4">
        <span className="block text-sm font-medium text-gray-700">Sort By:</span>
        <button
          className={`px-3 py-1 rounded text-sm ${sortCriteria === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
          onClick={() => handleSortChange('name')}
        >
          Name {sortCriteria === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${sortCriteria === 'company' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
          onClick={() => handleSortChange('company')}
        >
          Company {sortCriteria === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
        </button>
      </div>

      {/* View Toggle */}
      <div className="mb-4 text-right">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
          onClick={() => setIsCardView(!isCardView)}
        >
          Switch to {isCardView ? 'Table View' : 'Card View'}
        </button>
      </div>

      {/* Lead List */}
      {!loading && !error && (
        filteredAndSortedLeads.length === 0 ? (
          <p>No leads found. Add your first lead!</p>
        ) : (
          isCardView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLeads.map(lead => (
                <div key={lead.id} className="border rounded p-4 shadow-sm bg-white">
                  <h3 className="text-lg font-semibold">{lead.name}</h3>
                  <p><strong>Company:</strong> {lead.company || 'N/A'}</p>
                  <p><strong>Interest:</strong> {lead.interest}</p>
                  <p><strong>Status:</strong> {lead.status}</p>

                  <div className="mt-2 flex space-x-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      View
                    </button>

                    {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                      <>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleAssignLead(lead.id)}
                        >
                          Assign
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            setLeadToDeleteId(lead.id);
                            setLeadToDeleteName(lead.name);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full bg-white border rounded shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSortChange('name')}>
                    Name {sortCriteria === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSortChange('company')}>
                    Company {sortCriteria === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-2 px-4 text-left">Interest</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map(lead => (
                  <tr key={lead.id} className="border-t">
                    <td className="py-2 px-4">{lead.name}</td>
                    <td className="py-2 px-4">{lead.company || 'N/A'}</td>
                    <td className="py-2 px-4">{lead.interest}</td>
                    <td className="py-2 px-4">{lead.status}</td>
                    <td className="py-2 px-4 text-center space-x-1">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        View
                      </button>

                      {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                        <>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleAssignLead(lead.id)}
                          >
                            Assign
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setLeadToDeleteId(lead.id);
                              setLeadToDeleteName(lead.name);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4 flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}

      {/* Assign Lead Modal */}
      {isAssignModalOpen && (
        <AssignLeadModal
          leadId={selectedLeadId}
          onClose={() => setIsAssignModalOpen(false)}
          companyId={companyId}
        />
      )}

      {/* Delete Confirm Modal */}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          title={`Delete Lead "${leadToDeleteName}"?`}
          message="Are you sure you want to delete this lead? This action cannot be undone."
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteLead}
        />
      )}
    </div>
  );
};

export default LeadsList;
