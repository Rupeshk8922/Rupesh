// src/hooks/useSubscriptionCheck.js

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Custom hook to check subscription details for a given company.
 * Fetches subscription document from 'subscriptions' collection by companyId.
 * 
 * @param {string} companyId - Firebase company document ID
 * @returns {object} { subscription, loading, error, isSubscriptionActive }
 */
const useSubscriptionCheck = (companyId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subscription data function, memoized with useCallback
  const fetchSubscription = useCallback(async () => {
    if (!companyId) {
      setSubscription(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const subscriptionDocRef = doc(db, 'subscriptions', companyId);
      const subscriptionDocSnap = await getDoc(subscriptionDocRef);

      if (subscriptionDocSnap.exists()) {
        setSubscription(subscriptionDocSnap.data());
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.message);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Return boolean indicating if subscription is active
  const isSubscriptionActive = !!subscription && subscription.status === 'active';

  return { subscription, loading, error, isSubscriptionActive };
};

export default useSubscriptionCheck;
