// src/hooks/useOfficers.js
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Use alias '@' for clean import

const useOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          // Prefer displayName fallback to email
          displayName: doc.data().displayName || doc.data().email,
        }));
        setOfficers(officersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching officers:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  return { officers, loading, error };
};

export default useOfficers;
