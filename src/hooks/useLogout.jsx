import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthContext } from './useauthContext';

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const logout = async () => {
    setError(null);
    setIsPending(true);

    try {
      const auth = getAuth();
      await signOut(auth);

      dispatch({ type: 'LOGOUT' });
      setIsPending(false);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
      console.error('Logout error:', err);
    }
  };

  return { logout, error, isPending };
};

export default useLogout;
