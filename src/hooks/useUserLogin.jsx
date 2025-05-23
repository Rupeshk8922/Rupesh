import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

/**
 * Custom hook for user login via Firebase Authentication.
 * Handles loading and error states.
 * 
 * @returns {object} { handleUserLogin, loading, error }
 */
export const useUserLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUserLogin = async (email, password) => {
    setLoading(true);
    setError(null);

    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
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
