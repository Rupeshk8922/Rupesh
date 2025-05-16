import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/authContext'; // or useauthContext if that's the correct one

export const useSubscriptionType = () => {
  const { companyId } = useAuth(); // Make sure your context provides `companyId`
  const [subscriptionType, setSubscriptionType] = useState('free');

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!companyId) return;
      try {
        const docRef = doc(db, 'companies', companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSubscriptionType(docSnap.data().subscriptionType || 'free');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, [companyId]);

  return subscriptionType;
};
