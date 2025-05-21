import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Import Firebase configuration
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; // Corrected import name

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can customize this

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
      } catch (error) {
        setError('Error fetching users');
      }
      setLoading(false);
    };
    fetchUsers(); // No need to re-run on userRole change unless the filtering depends on it
  }, []);

  useEffect(() => {
    const filteredData = users.filter(user =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter === '' || user.role === roleFilter)
    );
    setFilteredUsers(filteredData);
    setCurrentPage(1); // Reset to first page on filter/search change
  }, [searchQuery, roleFilter, users]); // Added users as a dependency since filter depends on it

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleDelete = (userId) => {
    if (user && user.role === 'admin') { // Check if user exists and has admin role
      const confirmDelete = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
      if (confirmDelete) {
        setLoading(true);
        const userDocRef = doc(db, 'users', userId);
        deleteDoc(userDocRef)
          .then(() => {
            setUsers(users.filter(user => user.id !== userId));
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
      {/* Mobile Responsiveness: Ensure this message is readable on small screens */}
      {authLoading || (user && user.role !== 'admin') ? ( // Show loading or no access if not admin
        <div className="container mx-auto p-4 text-red-600">You do not have permission to view this page.</div>
      ) : (
        /* Mobile Responsiveness: Container padding adjusts slightly for smaller screens */
        <div className="container mx-auto p-4">
          {/* Mobile Responsiveness: Heading size can be adjusted if needed, current size is likely fine */}
          <h2 className="text-2xl font-bold mb-4">Users</h2>

          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name or email"
                className="px-3 py-2 border rounded"
              />{/* Mobile Responsiveness: Ensure input width is appropriate on small screens. `w-full` might be needed in a flex-col layout. */}
              {/* Mobile Responsiveness: Ensure select width is appropriate on small screens. */}
              <select value={roleFilter} onChange={handleRoleFilterChange} className="px-3 py-2 border rounded">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
              {/* Mobile Responsiveness: On small screens, consider stacking search and filter vertically using flex-col md:flex-row */}
            </div>

            {user && user.role === 'admin' && ( // Check if user exists and is admin
              <Link to="/dashboard/users/add" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <button>
                 Create User
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Responsiveness: Add overflow-x-auto to make the table horizontally scrollable on small screens */}
          <div className="overflow-x-auto"> {/* Added for horizontal scrolling */}
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
                  <tr><td colSpan="4" className="py-2 px-4 text-center text-red-600">Error loading users: {error}</td></tr>
                ) : (
                  paginatedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-100">
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {/* Mobile Responsiveness: Ensure buttons fit or stack nicely */}
 {user && user.role === 'admin' && ( // Check if user exists and is admin
 <>
 <Link to={`/dashboard/users/${user.id}/edit`}>
 <button className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600">
 Edit
 </button>
 </Link>
 <button onClick={() => handleDelete(user.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
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

          {/* Mobile Responsiveness: Pagination controls should remain centered and usable */}
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
