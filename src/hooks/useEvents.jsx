import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';

/**
 * Custom hook to fetch events for the current company from Firestore.
 * Supports loading and error states. Uses one-time fetch by default.
 *
 * To enable real-time updates, switch from getDocs() to onSnapshot()
 * (see commented code inside useEffect).
 *
 * @returns {{ events: Array, loading: boolean, error: Error | null }}
 */
export default function useEvents() {
  const { companyId, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    if (!db) {
      setError(new Error("Firestore DB not initialized"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const eventsRef = collection(db, 'data', companyId, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));

    // ONE-TIME FETCH VERSION:
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(q);
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchEvents();
    }

    // REAL-TIME VERSION (UNCOMMENT TO USE):
    // if (!authLoading) {
    //   const unsubscribe = onSnapshot(q, snapshot => {
    //     const eventsData = snapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     }));
    //     setEvents(eventsData);
    //     setLoading(false);
    //     setError(null);
    //   }, err => {
    //     setError(err);
    //     setLoading(false);
    //   });
    //   return () => unsubscribe();
    // }

  }, [companyId, authLoading]);

  return { events, loading: loading || authLoading, error };
}
