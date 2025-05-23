import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path as needed

interface EventData {
  title: string;
  date: string;
  // Add other relevant fields
}

export function useEditEvent(eventId: string) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent(docSnap.data() as EventData);
        } else {
          console.warn('Event not found');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent(); // ✅ properly calls the local async function
    }
  }, [eventId]);

  return { event, loading };
}
