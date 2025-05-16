// useCompanyDonors.js
import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCompanyDonors = (companyId) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const q = query(collection(db, 'companies', companyId, 'donors'));
        const snapshot = await getDocs(q);
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDonors(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [companyId]);

  return { donors, loading, error };
};