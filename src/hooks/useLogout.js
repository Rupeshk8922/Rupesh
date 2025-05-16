import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../contexts/authContext';

export const useLogout = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuth(); // Assuming your useAuth context provides a dispatch function to update state

  const logout = async () => {
    setError(null);
    setIsPending(true);

    try {
      const auth = getAuth();
      await signOut(auth);

      // Dispatch logout action if your context uses a reducer or similar
      // dispatch({ type: 'LOGOUT' });

      setIsPending(false);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
      console.error(err); // Log the error for debugging
    }
  };

  return { logout, error, isPending };
};

export default useLogout;