import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../firebase/config'; // Assuming firebaseApp is exported from your config

const db = getFirestore(firebaseApp);

const useFetchSubscriptionStatus = (companyId) => {
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

    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);
      try {
        const subscriptionDocRef = doc(db, 'subscriptions', companyId);
        const subscriptionDocSnap = await getDoc(subscriptionDocRef);

        if (subscriptionDocSnap.exists()) {
          setSubscription(subscriptionDocSnap.data());
        } else {
          setSubscription(null); // No subscription found for this company
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [companyId]); // Re-run effect when companyId changes

  return { subscription, loading, error };
};

export default useFetchSubscriptionStatus;