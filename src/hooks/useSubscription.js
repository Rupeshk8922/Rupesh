import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useauthContext } from '../contexts/authContext';
export default function useSubscription() {const { companyId } = useauthContext();
  const [subscriptionType, setSubscriptionType] = useState('free');


  useEffect(() => {
    const fetchSubscription = async () => {
      if (!companyId) return; // Ensure companyId exists
      try {
        const docSnap = await getDoc(doc(db, 'companies', companyId));
        setSubscriptionType(docSnap?.data()?.subscriptionType || 'free');
      } catch (error) {
        console.error("Error fetching subscription:", error);
        // Optionally handle error state
      }
    };

    fetchSubscription();
  }, [companyId]);

  return subscriptionType;
}