import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';

/**
 * Custom hook to fetch events for the current company from Firestore.
 * Supports loading and error states. Uses one-time fetch.
 *
 * Future-ready:
 * - Easily upgrade to real-time updates using `onSnapshot`.
 * - Pagination logic can be added using `startAfter` and `limit`.
 *
 * @returns {{ events: Array, loading: boolean, error: Error | null }}
 */
export default function useEvents() {
  const { companyId, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!companyId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      if (!db) {
        setError(new Error("Database not initialized"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const eventsRef = collection(db, 'data', companyId, 'events');
        const q = query(eventsRef, orderBy('date', 'asc'));

        // Replace with onSnapshot for real-time updates if needed
        const snapshot = await getDocs(q);

        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventsData);
      } catch (err) {
        // Optionally refine: handle by error.code for more specific messages
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchEvents();
    }

    // To enable real-time updates, replace getDocs with onSnapshot
    // and return the unsubscribe function here:
    //
    // const unsubscribe = onSnapshot(q, (snapshot) => { ... });
    // return () => unsubscribe();

  }, [companyId, authLoading]);

  return {
    events,
    loading: loading || authLoading,
    error,
  };
}
