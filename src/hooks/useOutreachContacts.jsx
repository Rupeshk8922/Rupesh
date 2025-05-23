// src/hooks/useOutreachContacts.js

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/authContext';

/**
 * Custom hook to fetch and paginate outreach contacts
 * tied to the current user's company.
 */
const useOutreachContacts = () => {
  const { user, companyId } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user || !companyId) return;

    setLoading(true);
    setError(null);

    try {
      const contactsRef = collection(db, 'companies', companyId, 'outreachContacts');
      const q = query(contactsRef, orderBy('name'), limit(10));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setContacts(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 10);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, companyId]);

  const fetchMore = useCallback(async () => {
    if (!user || !companyId || !lastDoc || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const contactsRef = collection(db, 'companies', companyId, 'outreachContacts');
      const q = query(contactsRef, orderBy('name'), startAfter(lastDoc), limit(10));
      const snapshot = await getDocs(q);

      const newContacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setContacts(prev => [...prev, ...newContacts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 10);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, companyId, lastDoc, hasMore]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    // Reset when companyId changes
    if (companyId) {
      setContacts([]);
      setLastDoc(null);
      setHasMore(true);
      setLoading(true);
      setError(null);
      fetchContacts();
    }
  }, [companyId, fetchContacts]);

  return {
    contacts,
    loading,
    error,
    hasMore,
    fetchMore,
  };
};

export default useOutreachContacts;
