import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

const useOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['outreach_officer', 'admin'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const officersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          displayName: doc.data().displayName || doc.data().email,
        }));
        setOfficers(officersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching officers:', err);
        setError(err.message || 'Failed to fetch officers.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { officers, loading, error };
};

export default useOfficers;
