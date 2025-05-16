import { useState } from 'react'; // useCompanyLogin.js
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Ensure db is imported

export const useCompanyLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [role, setRole] = useState(null);

  const validateForm = (email, password) => {
    if (!email || !password) {
      setError('Both fields are required');
      return false;
    }
    return true;
  };

  const handleCompanyLogin = async (email, password) => {
    setError(null);
    setSubscriptionStatus(null);
    setRole(null);

    const isValid = validateForm(email, password);

    if (isValid) {
      setIsLoading(true);
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setSubscriptionStatus(userData.subscriptionType);
          setRole(userData.role);
        }

        const idToken = await user.getIdToken();

        try {
          const response = await fetch('https://verifycompanyloginv2-7fciy242nq-uc.a.run.app/verifyCompanyLoginV2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({}),
          });

          const data = await response.json();
          if (!response.ok) {
            setError(data.error || data.message || 'Company login verification failed');
          }
        } catch (fetchError) {
          console.error("Error during serverless function call:", fetchError);
          setError('An error occurred during company verification.');
        }
      } catch (loginError) {
        console.error("Login error:", loginError);
        setError('Login failed. Please check your credentials.');
      } finally {
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
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError('Failed to send password reset email. Please check the email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    login: handleCompanyLogin,
    sendPasswordReset,
    subscriptionStatus,
    role,
  };
};
