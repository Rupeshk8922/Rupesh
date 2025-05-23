import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

const useOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        const officersCollection = collection(db, 'officers');
        const officersSnapshot = await getDocs(officersCollection);
        const officersList = officersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          displayName: doc.data().displayName || doc.data().email,
        }));

        setOfficers(officersList);
      } catch (err) {
        setError(err.message || 'Failed to fetch officers');
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, []);

  return { officers, loading, error };
};

export default useOfficers;
