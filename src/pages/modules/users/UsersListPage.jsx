import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config.jsx';
import { Link } from 'react-router-dom'; // Assuming this import is correct
import { useAuth } from '../../../hooks/useAuth.jsx';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch {
        setError('Error fetching users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filteredData = users.filter(u =>
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter === '' || u.role === roleFilter)
    );
    setFilteredUsers(filteredData);
    setCurrentPage(1);
  }, [searchQuery, roleFilter, users]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleDelete = (userId) => {
    if (user && user.role === 'admin') {
      const confirmDelete = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
      if (confirmDelete) {
        setLoading(true);
        const userDocRef = doc(db, 'users', userId); // Corrected path if needed
        deleteDoc(userDocRef)
          .then(() => {
            setUsers(users.filter(u => u.id !== userId));
            alert('User deleted successfully.');
          })
          .catch((error) => {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
            setError('Error deleting user');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      alert('You do not have permission to delete this user.');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <>
      {authLoading || (user && user.role !== 'admin') ? (
        <div className="container mx-auto p-4 text-red-600">You do not have permission to view this page.</div>
      ) : (
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Users</h2>

          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name or email"
                className="px-3 py-2 border rounded w-full md:w-auto"
              />
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="px-3 py-2 border rounded w-full md:w-auto"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>

            {user && user.role === 'admin' && (
              <Link to="/dashboard/users/add" className="self-start">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Create User
                </button>
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                  <th className="py-2 px-4 border-b text-left">Role</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="py-2 px-4 text-center">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan="4" style={{ color: 'red' }} className="py-2 px-4 text-center">Error loading users: {error}</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="4" className="py-2 px-4 text-center text-gray-700">No users found.</td></tr>
                ) : (
                  paginatedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-100">
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        {user && user.role === 'admin' && (
                          <>
                            <Link to={`/dashboard/users/${u.id}/edit`}>
                              <button className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600">
                                Edit
                              </button>
                            </Link>
                            <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination mt-4 flex justify-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 mx-1">{currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 mx-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UsersPage;
