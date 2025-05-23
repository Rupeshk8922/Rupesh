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
      setVolunteers([]);  // Clear volunteers while loading or no companyId
      setLoading(true);
      setError(null);
      return;
    }

    // Base collection reference
    const volunteersRef = collection(db, 'data', companyId, 'volunteers');

    // Construct Firestore query with optional status filter
    let q;
    if (statusFilter) {
      q = query(volunteersRef, where('status', '==', statusFilter), orderBy('name', 'asc'));
    } else {
      q = query(volunteersRef, orderBy('name', 'asc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Client-side search filtering by name/email/phone (case-insensitive)
        if (searchTerm.trim()) {
          const lowerSearch = searchTerm.toLowerCase();
          results = results.filter(vol =>
            (vol.name?.toLowerCase().includes(lowerSearch) ||
             vol.email?.toLowerCase().includes(lowerSearch) ||
             vol.phone?.includes(lowerSearch))
          );
        }

        setVolunteers(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching volunteers:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, authLoading, searchTerm, statusFilter]);

  return { volunteers, loading, error };
}
