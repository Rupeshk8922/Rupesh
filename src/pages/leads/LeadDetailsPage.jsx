import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config.jsx';
import { useAuth } from '../../contexts/authContext.jsx';const LeadDetailsPage = () => {
  const { leadId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.companyId;
  const userRole = user?.role;

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowedRoles = ['admin', 'Manager', 'Outreach Officer'];
  const navigate = useNavigate();

  useEffect(() => {
    // Permission check
    if (!authLoading && !allowedRoles.includes(userRole)) {
      setError('You do not have permission to view this lead.');
      setLoading(false);
      return;
    }

    const fetchLeadData = async () => {
      setError(null); // Clear previous errors

      if (!companyId || !leadId) {
        setError('Company ID or Lead ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const leadDocRef = doc(db, 'companies', companyId, 'leads', leadId);
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

    if (!authLoading) {
      fetchLeadData();
    }
  }, [companyId, leadId, userRole, authLoading]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this lead?');
    if (!isConfirmed) return;

    if (!companyId || !leadId) {
      setError('Company ID or Lead ID is missing. Cannot delete.');
      return;
    }

    try {
      const leadDocRef = doc(db, 'companies', companyId, 'leads', leadId);
      await deleteDoc(leadDocRef);
      console.log('Lead deleted successfully');
      navigate('/dashboard/leads');
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead.');
    }
  };

  if (loading) return <div>Loading lead details...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
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

      {lead && allowedRoles.includes(userRole) && (
        <div className="mt-6 flex space-x-4">
          <a
            href={`/leads/${leadId}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Lead
          </a>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            type="button"
          >
            Delete Lead
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadDetailsPage;
