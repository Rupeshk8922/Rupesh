import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import { useAuth } from '../contexts/authContext.jsx';
function AdminDashboard() {
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [assignedLeads, setAssignedLeads] = useState({});
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user || userRole !== 'admin') {
        setLoading(false);
        setError('Unauthorized');
        return;
      }

      try {
        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const companyId = userData.companyId;

          const companyDocRef = doc(db, 'companies', companyId);
          const companySnap = await getDoc(companyDocRef);

          if (companySnap.exists()) {
            setCompanyData({ id: companySnap.id, ...companySnap.data() });

            const usersQuery = query(collection(db, 'users'), where('companyId', '==', companyId));
            const usersSnap = await getDocs(usersQuery);
            setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const leadsQuery = query(collection(db, 'companies', companyId, 'leads'));
            const leadsSnap = await getDocs(leadsQuery);
            const leadsList = leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const assigned = {};
            const unassigned = [];

            leadsList.forEach(lead => {
              if (lead.assignedTo) {
                if (!assigned[lead.assignedTo]) assigned[lead.assignedTo] = [];
                assigned[lead.assignedTo].push(lead);
              } else {
                unassigned.push(lead);
              }
            });

            setAssignedLeads(assigned);
            setUnassignedLeads(unassigned);
          } else {
            setError('Company data not found.');
          }
        } else {
          setError('User data not found.');
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, userRole]);

  const handleEditRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
      setEditingUser(null);
      setNewRole('');
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLead = async (userId, leadId) => {
    setLoading(true);
    try {
      const leadRef = doc(db, 'companies', companyData.id, 'leads', leadId);
      await updateDoc(leadRef, {
        assignedTo: userId,
        assignedAt: new Date()
      });

      const lead = unassignedLeads.find(l => l.id === leadId);
      setUnassignedLeads(unassignedLeads.filter(l => l.id !== leadId));
      setAssignedLeads(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), { ...lead, assignedTo: userId }]
      }));
    } catch (err) {
      console.error('Error assigning lead:', err);
      setError('Failed to assign lead.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  if (!user || userRole !== 'admin' || !companyData)
    return <div className="p-4 text-center text-red-600">Access Denied. You must be an administrator to view this page.</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard for {companyData.name}</h2>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Company Information</h3>
        <p><strong>Name:</strong> {companyData.name}</p>
        <p><strong>Subscription Type:</strong> {companyData.subscriptionType}</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.displayName}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">
                    {editingUser?.id === u.id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="border rounded p-1 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Outreach Officer">Outreach Officer</option>
                        <option value="CSR">CSR</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="telecaller">Telecaller</option>
                      </select>
                    ) : u.role}
                  </td>
                  <td className="p-2 border">
                    {editingUser?.id === u.id ? (
                      <>
                        <button onClick={handleSaveRole} className="text-green-600 hover:underline mr-2">Save</button>
                        <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:underline">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditRole(u)} className="text-blue-600 hover:underline">Edit Role</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Unassigned Leads</h3>
        {unassignedLeads.length === 0 ? (
          <p>No unassigned leads.</p>
        ) : (
          <table className="w-full border text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Contact</th>
                <th className="p-2 border">Assign</th>
              </tr>
            </thead>
            <tbody>
              {unassignedLeads.map(lead => (
                <tr key={lead.id}>
                  <td className="p-2 border">{lead.name}</td>
                  <td className="p-2 border">{lead.contact}</td>
                  <td className="p-2 border">
                    <select
                      onChange={(e) => handleAssignLead(e.target.value, lead.id)}
                      className="border rounded p-1 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign To...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Assigned Leads</h3>
        {Object.keys(assignedLeads).length === 0 ? (
          <p>No leads assigned yet.</p>
        ) : (
          <table className="w-full border text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Lead Name</th>
                <th className="p-2 border">Contact</th>
                <th className="p-2 border">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(assignedLeads).map(([userId, leads]) =>
                leads.map(lead => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <tr key={lead.id}>
                      <td className="p-2 border">{lead.name}</td>
                      <td className="p-2 border">{lead.contact}</td>
                      <td className="p-2 border">{user ? user.displayName : 'Unknown'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
