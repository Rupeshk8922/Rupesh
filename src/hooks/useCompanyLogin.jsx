import { useState, useEffect, useRef } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const VERIFY_COMPANY_LOGIN_URL = 'https://us-central1-empact-yhwq3.cloudfunctions.net/api/verifyCompanyLoginV2';

export const useCompanyLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [role, setRole] = useState(null);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!db) {
    console.error("Firebase Firestore DB is not initialized!");
    throw new Error("Firebase Firestore DB is not initialized!");
  }

  const validateForm = (email, password) => {
    return email && password;
  };

  const handleCompanyLogin = async (email, password) => {
    setError(null);
    setSubscriptionStatus(null);
    setRole(null);

    if (!validateForm(email, password)) {
      const validationMessage = 'Both email and password are required.';
      setError(validationMessage);
      throw new Error(validationMessage);
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user Firestore data
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error('User document not found in Firestore.');
      }

      const userData = userDocSnap.data();
      if (!userData) throw new Error('User data is undefined after fetching.');

      // Update states only if still mounted
      if (isMounted.current) {
        setSubscriptionStatus(userData.subscriptionType);
        setRole(userData.role);
      }

      // Backend company login verification
      const idToken = await user.getIdToken();

      const response = await fetch(VERIFY_COMPANY_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data.error || data.message || 'Company login verification failed.';
        if (isMounted.current) setError(errMsg);
        throw new Error(errMsg);
      }

      console.log('Company verification passed.');

      return user; // Optionally return user for further use

    } catch (loginError) {
      console.error('Login error:', loginError);

      if (isMounted.current && !error) {
        setError(loginError.message || 'Login failed. Please check your credentials.');
      }
      throw loginError;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const sendPasswordReset = async (email) => {
    setError(null);
    setIsLoading(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent.');
    } catch (err) {
      console.error('Error sending password reset email:', err);
      if (isMounted.current) {
        setError('Failed to send password reset email. Please check the email address.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    error,
    login: handleCompanyLogin,
    sendPasswordReset,
    subscriptionStatus,
    role,
  };
};
