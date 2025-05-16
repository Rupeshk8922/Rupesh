import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/authContext.jsx';

const LeadDetailsPage = () => {
  const { leadId } = useParams();
  const { user, loading: authLoading } = useAuth(); // Use useAuth correctly and get user and authLoading
  const companyId = user?.companyId; // Access companyId from user object
  const userRole = user?.role; // Access userRole from user object  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowedRoles = ['admin', 'Manager', 'Outreach Officer'];
  const navigate = useNavigate();

  useEffect(() => {
    // Check permissions before fetching
    if (!authLoading && !allowedRoles.includes(userRole)) { // Check authLoading before checking userRole
      setError('You do not have permission to view this lead.');
      setLoading(false);
      return;
    }

    const fetchLeadData = async () => {
      if (!companyId || !leadId) {
        setError('Company ID or Lead ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const leadDocRef = doc(db, 'data', companyId, 'leads', leadId);
        const leadDocSnap = await getDoc(leadDocRef);

        if (leadDocSnap.exists()) {
          setLead(leadDocSnap.data());
        } else {
          setError('Lead not found.');
        }
      } catch (err) {
        console.error('Error fetching lead data:', err);
        setError('Failed to fetch lead data.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) { // Fetch data only after auth state is loaded
      fetchLeadData();
    }
  }, [companyId, leadId, userRole, authLoading]); // Add authLoading to dependencies

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this lead?');
    if (isConfirmed) {
      if (!companyId || !leadId) {
        setError('Company ID or Lead ID is missing. Cannot delete.');
        return;
      }
      try {
        const leadDocRef = doc(db, 'data', companyId, 'leads', leadId);
        await deleteDoc(leadDocRef);
        console.log('Lead deleted successfully');
        navigate('/dashboard/leads');
      } catch (err) {
        console.error('Error deleting lead:', err);
        setError('Failed to delete lead.');
      }
    }
  };

  if (loading) return <div>Loading lead details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lead Details</h2>

      {lead && (
        <div className="space-y-4">
          <div>
            <p className="font-medium">Name:</p>
            <p>{lead.name}</p>
          </div>
          <div>
            <p className="font-medium">Email:</p>
            <p>{lead.contact}</p>
          </div>
          <div>
            <p className="font-medium">Contact:</p>
            <p>{lead.phone}</p>
          </div>
          <div>
            <p className="font-medium">Status:</p>
            <p>{lead.status}</p>
          </div>
          <div>
            <p className="font-medium">Source:</p>
            <p>{lead.source}</p>
          </div>
          <div>
            <p className="font-medium">Notes:</p>
            <p>{lead.notes}</p>
          </div>
        </div>
      )}

      {lead && leadId && allowedRoles.includes(userRole) && (
        <div className="mt-4 flex space-x-2">
          <Link
            to={`/leads/${leadId}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Lead
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Lead
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadDetailsPage;
