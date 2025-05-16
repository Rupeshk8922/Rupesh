import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config'; // Adjust the path as needed
import { useauthContext } from '../../../context/authContext'; // Changed import here
function UsersPage() {
  const { companyId } = useAuth(); // Get the logged-in user's company ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the logged-in user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) {
        setError('Company ID is not available.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Assuming 'users' collection has a 'companyId' field
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);
        const usersList = querySnapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(userData => userData.companyId === companyId); // Filter users by companyId
        setUsers(usersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users.');
        setLoading(false);
      }
    };
    // Fetch users only if companyId is available
    fetchUsers();
  }, [companyId]); // Re-run effect when companyId changes

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);
        // Update the state to remove the deleted user
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user.');
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      {users.length === 0 ? (
        <p>No users found for this company.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Add Edit and Delete actions here */}
                  {/* Example Delete Button */}
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default UsersPage;