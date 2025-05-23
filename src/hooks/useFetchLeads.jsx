import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFetchLeads = (companyId, userId) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!companyId || !userId) {
        setLeads([]);
        setIsLoading(false);
        setError(null); // Clear any previous errors
        return;
      }

      setIsLoading(true);
      setError(null);
      setLeads([]); // Clear old leads before fetching new

      try {
        const leadsCollectionRef = collection(db, 'leads');
        const q = query(
          leadsCollectionRef,
          where('companyId', '==', companyId),
          where('assignedTo', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const leadsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLeads(leadsList);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError(err.message || 'Failed to fetch leads.');
        setLeads([]); // Clear data on error to avoid stale display
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [companyId, userId]);

  return { leads, isLoading, error };
};
