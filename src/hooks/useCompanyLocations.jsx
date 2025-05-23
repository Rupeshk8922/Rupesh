import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCompanyLocations = (companyId) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLocations([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'companies', companyId, 'locations'));
        const snapshot = await getDocs(q);
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (!isCancelled) {
          setLocations(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      isCancelled = true;
    };
  }, [companyId]);

  return { locations, loading, error };
};
