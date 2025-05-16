import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config'; // Assuming db is exported from your config

export const useFetchLeads = (companyId, userId) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!companyId || !userId) {
        setIsLoading(false);
        setLeads([]);
        // setError("Company ID or User ID is missing."); // Optionally set an error
        return;
      }

      setIsLoading(true);
      setError(null);
      setLeads([]); // Clear previous leads

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
          ...doc.data()
        }));

        setLeads(leadsList);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError('Failed to fetch leads.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [companyId, userId]); // Re-run effect when companyId or userId changes

  return { leads, isLoading, error };
};