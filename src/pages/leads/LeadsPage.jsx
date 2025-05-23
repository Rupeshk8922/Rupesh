import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { format } from 'date-fns';
import { useFetchLeads } from '../hooks/useFetchLeads.jsx';
import { useFetchCompanyUsers } from '../hooks/useFetchCompanyUsers.jsx';
import { assignLead as assignLeadService } from '../services/leadsService';
import { useNavigate } from 'react-router-dom';
import LeadsList from '../components/leads/LeadsList';

function LeadsPage() {
  const { user, companyId, userRole } = useAuth();
  const navigate = useNavigate();

  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    fetchLeads: fetchLeadsHook,
  } = useFetchLeads(companyId);

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useFetchCompanyUsers(companyId);

  const [assignableUsers, setAssignableUsers] = useState([]);
  const [assigningLead, setAssigningLead] = useState(false);

  useEffect(() => {
    if (Array.isArray(users)) {
      const filteredUsers = users.filter(user =>
        ['Outreach Officer', 'Telecaller', 'Manager'].includes(user.role)
      );
      setAssignableUsers(filteredUsers);
    }
  }, [users]);

  const exportLeadsToCsv = () => {
    if (!leads || leads.length === 0) {
      alert('No leads to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Company',
      'Email',
      'Phone',
      'Interest',
      'Status',
      'Assigned To',
      'Created At',
    ];

    const csvRows = leads.map(lead => {
      const createdAt = lead.createdAt?.toDate
        ? format(lead.createdAt.toDate(), 'yyyy-MM-dd HH:mm:ss')
        : '';
      return [
        lead.id,
        lead.name || '',
        lead.company || '',
        lead.email || '',
        lead.phone || '',
        lead.interest || '',
        lead.status || '',
        lead.assignedTo || '',
        createdAt,
      ]
        .map(field => `"${String(field).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssignLead = async (leadId, userId) => {
    if (!companyId) {
      console.error('Missing company ID.');
      return;
    }
    setAssigningLead(true);
    try {
      await assignLeadService(leadId, userId, companyId);
      fetchLeadsHook(); // Refresh leads after assignment
    } catch (error) {
      console.error('Failed to assign lead:', error);
    } finally {
      setAssigningLead(false);
    }
  };

  const isAuthorized = ['admin', 'Manager', 'Outreach Officer', 'telecaller'].some(
    role => role.toLowerCase() === userRole?.toLowerCase()
  );

  if (!user || !isAuthorized) {
    return (
      <div className="p-4 text-center text-red-600">
        Access Denied. You do not have permission to view this page.
      </div>
    );
  }

  if (leadsLoading || usersLoading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading leads and users...
      </div>
    );
  }

  if (leadsError || usersError) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: {leadsError?.message || usersError?.message || 'Failed to load data.'}
      </div>
    );
  }

  return (
    <div className="p-4 container mx-auto">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h2 className="text-2xl font-semibold">All Leads</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/dashboard/crm/leads/create')}
          >
            Add New Lead
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={exportLeadsToCsv}
          >
            Export to CSV
          </button>
        </div>
      </div>

      {assigningLead && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="text-white text-xl">Assigning Lead...</div>
        </div>
      )}

      <LeadsList
        leads={leads}
        assignableUsers={assignableUsers}
        loading={leadsLoading}
        error={leadsError}
        companyId={companyId}
        userRole={userRole}
        onAssignLead={handleAssignLead}
      />
    </div>
  );
}

export default LeadsPage;
