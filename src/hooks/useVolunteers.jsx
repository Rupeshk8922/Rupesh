import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext.jsx';
import { db } from '../firebase/config';

export default function useVolunteers({ searchTerm = '', statusFilter = '' } = {}) {
  const { companyId, loading: authLoading } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !companyId) {
      setLoading(true);
      return;
    }

    // Reference path
    let volunteersRef = collection(db, 'data', companyId, 'volunteers');
    let q = query(volunteersRef, orderBy('name', 'asc'));

    // Filtering by status (if provided)
    if (statusFilter) {
      q = query(volunteersRef, where('status', '==', statusFilter), orderBy('name', 'asc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Local search filtering by name/email/phone
        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          results = results.filter(vol =>
            (vol.name?.toLowerCase()?.includes(lowerSearch) ||
             vol.email?.toLowerCase()?.includes(lowerSearch) ||
             vol.phone?.includes(lowerSearch))
          );
        }

        setVolunteers(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching volunteers:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, [companyId, authLoading, searchTerm, statusFilter]);

  return { volunteers, loading, error };
}
