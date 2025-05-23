import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useDocument = (collectionName, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !id) {
      setDocument(null);
      setError('Invalid collection name or document ID');
      return;
    }

    const ref = doc(db, collectionName, id);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setDocument({ id: snapshot.id, ...snapshot.data() });
          setError(null);
        } else {
          setDocument(null);
          setError('No such document exists');
        }
      },
      (err) => {
        console.error(err.message);
        setError('Failed to get document');
      }
    );

    // Cleanup subscription on unmount or when inputs change
    return () => unsubscribe();

  }, [collectionName, id]);

  return { document, error };
};
