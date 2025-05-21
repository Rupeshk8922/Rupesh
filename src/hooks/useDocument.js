import { useState } from 'react';
import {
  doc,
  onSnapshot
} from 'firebase/firestore';
import {
  db
} from '../firebase/config';

export const useDocument = (collectionName, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  // realtime document data
  // useEffect(() => {
  const ref = doc(db, collectionName, id);

  onSnapshot(ref, snapshot => {
    // need to make sure the doc exists & has data
    if (snapshot.data()) {
      setDocument({
        ...snapshot.data(),
        id: snapshot.id
      });
      setError(null);
    } else {
      setError('No such document exists');
    }
  }, err => {
    console.log(err.message);
    setError('failed to get document');
  });

  // unsubscribe on unmount
  // return () => unsubscribe();

  // }, [collectionName, id]);

  // Manually manage subscription lifecycle
  const subscribe = () => {
    const ref = doc(db, collectionName, id);

    const unsubscribe = onSnapshot(ref, snapshot => {
      if (snapshot.data()) {
        setDocument({
          ...snapshot.data(),
          id: snapshot.id
        });
        setError(null);
      } else {
        setError('No such document exists');
      }
    }, err => {
      console.log(err.message);
      setError('failed to get document');
    });

    return unsubscribe; // Return the unsubscribe function
  };

  return {
    document,
    error,
    subscribe
  };
};