// src/hooks/useSubscriptionType.js

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/authContext';

/**
 * Custom hook to fetch the subscription type of the current company.
 * Returns 'free' by default if not set or not found.
 */
export const useSubscriptionType = () => {
  const { companyId } = useAuth(); // Assumes companyId is available via context
  const [subscriptionType, setSubscriptionType] = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists()) {
          const type = companySnap.data().subscriptionType || 'free';
          setSubscriptionType(type);
        } else {
          setSubscriptionType('free');
        }
      } catch (err) {
        console.error('Failed to fetch subscription type:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [companyId]);

  return { subscriptionType, loading, error };
};
