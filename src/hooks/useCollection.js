// Placeholder for useCollection hook.
// This file is a placeholder to allow the build to proceed.
// Replace with actual useCollection hook implementation.

import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';

export const useCollection = (collection, _query, _orderBy) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);

  // if we don't use a ref, infinite loop in useEffect
  // _query is an array and is different on every function call
  const query = useRef(_query).current;
  const orderBy = useRef(_orderBy).current;

  useEffect(() => {
    let collectionRef = db.collection(collection);

    if (query) {
      collectionRef = collectionRef.where(...query);
    }
    if (orderBy) {
      collectionRef = collectionRef.orderBy(...orderBy);
    }

    const unsubscribe = collectionRef.onSnapshot(
      (snapshot) => {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });

        // update state
        setDocuments(results);
        setError(null);
      },
      (error) => {
        console.log(error);
        setError('could not fetch the data');
      }
    );

    // unsubscribe on unmount
    return () => unsubscribe();
  }, [collection, query, orderBy]);

  return { documents, error };
};