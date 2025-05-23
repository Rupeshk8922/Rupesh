import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config'; // Your initialized Firestore instance
import { useAuth } from './useAuth'; // Hook providing companyId and auth loading state

/**
 * Custom hook to fetch leads for the current company from Firestore in real-time.
 *
 * @returns {{ leads: Array, loading: boolean, error: Error | null }}
 */
export const useLeads = () => {
  const { companyId, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchLeads = () => {
      if (!companyId) {
        setLeads([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const leadsRef = collection(db, 'data', companyId, 'leads');
        const q = query(leadsRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeads(leadsData);
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching leads:', err);
            setError(err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up leads listener:', err);
        setError(err);
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchLeads();
    }

    // Cleanup listener on unmount or dependency change
    return () => unsubscribe();
  }, [companyId, authLoading]);

  return { leads, loading: loading || authLoading, error };
};

export default useLeads;
