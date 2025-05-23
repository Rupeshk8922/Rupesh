import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AssignLeadModal = ({ isOpen, onClose, leadId }) => {
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      setSelectedUserId('');
      setError(null);
      setSuccess(false);
    } else {
      // Reset all states on modal close
      setAssignableUsers([]);
      setSelectedUserId('');
      setLoading(false);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

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
        assignedAt: new Date(),
        // optionally assignedBy: currentUserId if you have it
      });
      setSuccess(true);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-lead-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full" tabIndex={-1}>
        <h2 id="assign-lead-title" className="text-lg font-bold mb-4">
          Assign Lead
        </h2>
        <p>Assigning Lead ID: {leadId}</p>

        <div className="my-4">
          <label htmlFor="assign-user-select" className="block mb-1 font-medium">
            Select a user to assign this lead to:
          </label>
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <select
              id="assign-user-select"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select User --</option>
              {assignableUsers.map(({ id, name, email }) => (
                <option key={id} value={id}>
                  {name || email}
                </option>
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
