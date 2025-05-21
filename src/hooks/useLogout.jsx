import { getAuth, signOut } from 'firebase/auth';

export const useLogout = () => {
  const logout = async () => {
    // setError(null);
    // setIsPending(true);

    try {
      const auth = getAuth();
      await signOut(auth);

      // Dispatch logout action if your context uses a reducer or similar
      // dispatch({ type: 'LOGOUT' });


    } catch (err) {
      setError(err.message);
      setIsPending(false);
      console.error(err); // Log the error for debugging
    }
  };

  return { logout };
};
export default useLogout;