import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/config'; // Adjust path as needed
import { useAuth } from '../contexts/authContext.jsx'; // Corrected hook name and path
import { Link } from 'react-router-dom';

function LeadsList() {
  const [filterStatus, setFilterStatus] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState(''); // Moved state inside the component
  const { userRole, companyId } = useAuth(); // Use the corrected hook name
  const fetchLeads = useCallback(async (search = '', status = '', startAfterDoc = null) => {
    if (!companyId) {
      setError('Company ID is missing.');
      setLoading(false);
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      let leadsQuery = query(
        collection(db, 'companies', companyId, 'leads'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (status) {
        leadsQuery = query(leadsQuery, where('status', '==', status));
      }

      if (startAfterDoc) {
        leadsQuery = query(leadsQuery, startAfter(startAfterDoc));
      }

      // Firestore does not support partial text search well. This is a warning.
      if (search) {
        console.warn("Basic text search in Firestore has limitations. Consider a dedicated search solution.");
        // Optionally fetch all and filter client side - but this might be heavy.
      }

      const querySnapshot = await getDocs(leadsQuery);
      const leadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      if (startAfterDoc) {
        setLeads(prev => [...prev, ...leadsData]);
      } else {
        setLeads(leadsData);
      }
      setLastDoc(lastVisible);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchLeads(searchTerm, filterStatus);
  }, [searchTerm, filterStatus, companyId, fetchLeads]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleLoadMore = () => {
    if (lastDoc) {
      fetchLeads(searchTerm, filterStatus, lastDoc);
    }
  };

  if (loading && leads.length === 0) return <div className="p-4 text-center">Loading leads...</div>;
  if (error && leads.length === 0) return <div className="p-4 text-center text-red-600">Error loading leads: {error}</div>;

  const canViewLeads = userRole && ['admin', 'Manager', 'Outreach Officer', 'Telecaller', 'CSR'].includes(userRole);

  if (!canViewLeads) {
    return <div className="p-4 text-red-600">You do not have permission to view leads.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Leads</h2>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search leads..."
            className="w-full sm:w-auto px-3 py-2 border rounded"
          />
          <select
            value={filterStatus}
            onChange={handleFilterStatusChange}
            className="w-full sm:w-auto px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {userRole && ['admin', 'Manager', 'Outreach Officer'].includes(userRole) && (
          <Link to="/dashboard/leads/add" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add New Lead
            </button>
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Assigned To</th>
              <th className="py-2 px-4 border-b text-left">Created At</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && !loading && !error ? (
              <tr><td colSpan="5" className="py-2 px-4 text-center">No leads found.</td></tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">
                    <Link to={`/dashboard/leads/${lead.id}`} className="text-blue-600 hover:underline">
                      {lead.fullName || lead.name || 'N/A'}
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b">{lead.status || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{lead.assignedToName || 'Unassigned'}</td>
                  <td className="py-2 px-4 border-b">
                    {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {userRole && ['admin', 'Manager', 'Outreach Officer'].includes(userRole) && (
                      <Link to={`/dashboard/leads/${lead.id}/edit`}>
                        <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                          Edit
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
            {loadingMore && (
              <tr>
                <td colSpan="5" className="py-2 px-4 text-center">Loading more...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && !loadingMore && leads.length > 0 && lastDoc && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default LeadsList;
