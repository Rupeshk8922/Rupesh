// src/hooks/useSignup.js

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthContext } from './useAuthContext';

/**
 * Custom hook to sign up a user and update display name.
 */
export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, displayName) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (!res) throw new Error('Signup failed. Please try again.');

      await updateProfile(res.user, { displayName });

      dispatch({ type: 'LOGIN', payload: res.user });

      setIsPending(false);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { signup, error, isPending };
};
