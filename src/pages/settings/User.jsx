import { useAuth } from '@/hooks/useAuth';

const User = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading user information...</p>;
  }

  if (!user) {
    return <p>User not logged in.</p>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Information</h2>
      <div className="space-y-2 text-gray-700">
        <p><strong>Name:</strong> {user.name || 'N/A'}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};

export default User;
