import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query as firestoreQuery,
  where,
  orderBy as firestoreOrderBy,
  onSnapshot,
} from 'firebase/firestore';

/**
 * Custom hook to listen to a Firestore collection with optional query and orderBy.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {Array<Array>} [queries=[]] - Array of where clauses e.g. [['field', '==', 'value']]
 * @param {Array<Array>} [orderBys=[]] - Array of orderBy clauses e.g. [['field', 'asc']]
 * @returns {{documents: Array| null, error: string | null}}
 */
export const useCollection = (collectionName, queries = [], orderBys = []) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      let collectionRef = collection(db, collectionName);

      const constraints = [];

      if (queries.length) {
        queries.forEach((q) => {
          constraints.push(where(...q));
        });
      }

      if (orderBys.length) {
        orderBys.forEach((o) => {
          constraints.push(firestoreOrderBy(...o));
        });
      }

      const q = firestoreQuery(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const results = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDocuments(results);
          setError(null);
        },
        () => {
          setError('Could not fetch the data');
        }
      );

      return () => unsubscribe();
    } catch {
      setError('Failed to initialize query');
      return () => {};
    }
  }, [collectionName, JSON.stringify(queries), JSON.stringify(orderBys)]);

  return { documents, error };
};
