import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCompanyLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [role, setRole] = useState(null);

  if (!db) {
    console.error("Firebase Firestore DB is not initialized!");
    throw new Error("Firebase Firestore DB is not initialized!");
  }

  const validateForm = (email, password) => {
    return email && password;
  };

  const handleCompanyLogin = async (email, password) => {
    console.log('handleCompanyLogin called with email:', email);
    setError(null);
    setSubscriptionStatus(null);
    setRole(null);

    if (!validateForm(email, password)) {
      const validationMessage = 'Both fields are required';
      setError(validationMessage);
      throw new Error(validationMessage);
    }

    setIsLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase login successful. User:', user);

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (!userData) throw new Error('User data is undefined after fetching');

        console.log('Fetched user data:', userData);
        setSubscriptionStatus(userData.subscriptionType);
        setRole(userData.role);
      } else {
        throw new Error('User document not found in Firestore');
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        'https://us-central1-empact-yhwq3.cloudfunctions.net/api/verifyCompanyLoginV2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.error || data.message || 'Company login verification failed';
        setError(errMsg);
        throw new Error(errMsg);
      }

      console.log('Company verification passed.');
    } catch (loginError) {
      console.error("Login error:", loginError);
      if (!error) {
        setError('Login failed. Please check your credentials.');
      }
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email) => {
    setError(null);
    setIsLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent.");
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError('Failed to send password reset email. Please check the email address.');
    } finally {
      setIsLoading(false);
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
