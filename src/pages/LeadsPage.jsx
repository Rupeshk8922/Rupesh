import React, { useState, useEffect } from 'react';
import { fetchLeads, assignLead as assignLeadService } from '../services/leadsService'; // Import service functions
import { fetchUsersForAssignment } from '../services/userService'; // Assuming a userService for fetching users
import { useAuth } from '../contexts/authContext'; // Use the correct hook name and path

function LeadsPage() {
  const { user, companyId, userRole } = useAuth(); // Use the correctly imported hook
  const [leads, setLeads] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const [error, setError] = useState(null);
  const [availableStatuses, setAvailableStatuses] = useState([]);

  useEffect(() => {
    const fetchLeadsAndUsers = async () => {
      setLoading(true);
      setError(null);

      if (!companyId) {
        setError('Company ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const leadsData = await fetchLeads(companyId);
        setLeads(leadsData);

        const usersData = await fetchUsersForAssignment(companyId);
        setAssignableUsers(usersData);

        const uniqueStatuses = [...new Set(leadsData.map(lead => lead.status).filter(status => status))];
        setAvailableStatuses(uniqueStatuses);
      } catch (err) {
        setError('Failed to fetch data.');
        console.error('Error fetching leads or users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsAndUsers();
  }, [companyId]);

  // Effect to determine mobile view based on screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768); // Use Tailwind's 'md' breakpoint
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize); // Clean up event listener
  }, []);

  const handleAssignLead = async (leadId, userId) => {
    if (!companyId) {
      setError('Company ID is missing, cannot assign lead.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await assignLeadService(leadId, userId, companyId);

      setLeads(prevLeads => prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, assignedTo: userId } : lead
      ));
    } catch (err) {
      setError('Failed to assign lead.');
      console.error('Error assigning lead:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredLeads = leads.filter(lead => {
    if (filterStatus && lead.status !== filterStatus) {
      return false;
    }

    if (filterAssignedTo) {
      if (filterAssignedTo === 'unassigned' && lead.assignedTo) {
        return false;
      } else if (filterAssignedTo !== 'unassigned' && lead.assignedTo !== filterAssignedTo) {
        return false;
      }
    }

    if (searchTerm &&
        !(lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.contact?.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  });

  // Role-based access check
  if (!user || (userRole !== 'admin' && userRole !== 'Manager' && userRole !== 'Outreach Officer' && userRole !== 'telecaller')) {
    return (
      <div className="p-4 text-red-600 text-center">
        Access Denied. You do not have permission to view leads.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading leads...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-4 container mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Leads</h2>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by Name or Contact"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          {availableStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={filterAssignedTo}
          onChange={(e) => setFilterAssignedTo(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="">All Users</option>
          <option value="unassigned">Unassigned</option>
          {assignableUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.displayName}
            </option>
          ))}
        </select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No leads found for this company.</div>
      ) : (
        <>
          {isMobileView ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map(lead => {
                const assignedUser = assignableUsers.find(user => user.id === lead.assignedTo);
                return (
                  <div key={lead.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">{lead.name}</h3>
                    <p className="text-gray-600 text-sm mb-1"><strong>Contact:</strong> {lead.contact}</p>
                    <p className="text-gray-600 text-sm mb-1"><strong>Status:</strong> {lead.status}</p>
                    {lead.source && <p className="text-gray-600 text-sm mb-1"><strong>Source:</strong> {lead.source}</p>}
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Assigned To:</strong>{' '}
                      {assignedUser ? (
                        assignedUser.displayName
                      ) : (
                        <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">Unassigned</span>
                      )}
                    </p>

                    {(userRole === 'admin' || userRole === 'Manager' || userRole === 'Outreach Officer') && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <select
                          value={lead.assignedTo || ''}
                          onChange={(e) => handleAssignLead(lead.id, e.target.value === '' ? null : e.target.value)}
                          className="border rounded p-1 text-sm w-full"
                          disabled={loading}
                        >
                          <option value="">Unassigned</option>
                          {assignableUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.displayName}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-left rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Contact</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Source</th>
                    <th className="p-2 border">Assigned To</th>
                    {(userRole === 'admin' || userRole === 'Manager' || userRole === 'Outreach Officer') && (
                      <th className="p-2 border">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const assignedUser = assignableUsers.find(user => user.id === lead.assignedTo);
                    return (
                      <tr key={lead.id}>
                        <td className="p-2 border">{lead.name}</td>
                        <td className="p-2 border">{lead.contact}</td>
                        <td className="p-2 border">{lead.status}</td>
                        <td className="p-2 border">{lead.source}</td>
                        <td className="p-2 border">
                          {assignedUser ? (
                            assignedUser.displayName
                          ) : (
                            <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">Unassigned</span>
                          )}
                        </td>
                        {(userRole === 'admin' || userRole === 'Manager' || userRole === 'Outreach Officer') && (
                          <td className="p-2 border">
                            <select
                              value={lead.assignedTo || ''}
                              onChange={(e) => handleAssignLead(lead.id, e.target.value === '' ? null : e.target.value)}
                              className="border rounded p-1 text-sm w-full sm:w-auto"
                              disabled={loading}
                            >
                              <option value="">Unassigned</option>
                              {assignableUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.displayName}</option>
                              ))}
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LeadsPage;