import React from 'react';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'; // No hooks used here
import { db } from '../../firebase/config'; // Import your Firestore instance

const AssignLeadModal = ({ isOpen, onClose, leadId }) => {
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(false); // State for success message

  useEffect(() => {
    if (isOpen) {
      const fetchAssignableUsers = async () => {
        setLoading(true);
        setError(null);
        try {
          const usersCollectionRef = collection(db, 'users');
          const q = query(usersCollectionRef, where('role', 'in', ['Outreach Officer', 'Telecaller']));
          const querySnapshot = await getDocs(q);
          const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAssignableUsers(usersList);
        } catch (err) {
          setError('Failed to fetch assignable users.');
          console.error('Error fetching assignable users:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchAssignableUsers();
      // Reset selected user and messages when modal opens
      setSelectedUserId('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]); // Fetch users when the modal opens

  const handleAssignButtonClick = async () => {
    if (!selectedUserId) {
      setError('Please select a user to assign.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const leadDocRef = doc(db, 'leads', leadId);
      await updateDoc(leadDocRef, {
        assignedTo: selectedUserId,
        // You might want to add other fields here, like assignedBy, assignedAt, etc.
      });
      setSuccess(true);
      // Optionally close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to assign lead.');
      console.error('Error assigning lead:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Assign Lead</h2>
        <p>Assigning Lead ID: {leadId}</p>

        <div className="my-4">
          <p>Select a user to assign this lead to:</p>
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select User --</option>
              {assignableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name || user.email}</option> // Display name or email
              ))}
            </select>
          )}
        </div>

        {success && <p className="text-green-500 mb-4">Lead assigned successfully!</p>}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 rounded border" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleAssignButtonClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!selectedUserId || loading}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;
