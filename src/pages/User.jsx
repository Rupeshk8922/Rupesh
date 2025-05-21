
import { useAuth } from '@/hooks/useAuth';

const User = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>User Information</h2>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          {/* Add other user information here */}
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default User;