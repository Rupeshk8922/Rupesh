import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Assuming authContext is needed here, though not used in the provided snippet
export const useUserLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleUserLogin = async (email, password) => {
    setLoading(true);
    setError(null);

    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      return userCredential; // Return the result of the sign-in operation
    } catch (err) {
      console.error('User login error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleUserLogin, loading, error };
};