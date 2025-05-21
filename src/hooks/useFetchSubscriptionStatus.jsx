import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '../firebase/config';

const db = getFirestore(firebaseApp);

export const useFetchSubscriptionStatus = (companyId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
    if (!companyId) {
      setSubscription(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const subscriptionDocRef = doc(db, 'subscriptions', companyId);
    
    const unsubscribe = onSnapshot(
      subscriptionDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSubscription(docSnap.data());
        } else {
          setSubscription(null); // No subscription found
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to subscription status:', err);
        setError(`Failed to listen to subscription for companyId: ${companyId}. ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [companyId]);

  return { subscription, loading, error };
};
