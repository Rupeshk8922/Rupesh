import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCompanyDonors = (companyId) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setDonors([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'companies', companyId, 'donors'));
        const snapshot = await getDocs(q);
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (!isCancelled) {
          setDonors(result);
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

    fetchDonors();

    return () => {
      isCancelled = true;
    };
  }, [companyId]);

  return { donors, loading, error };
};
