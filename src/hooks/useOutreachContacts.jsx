import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase'; // Your Firebase initialization
import { collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
const useOutreachContacts = () => {
  const { user: currentUser, companyId } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const initialFetch = useCallback(async () => {
    if (!currentUser || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const contactsRef = collection(db, 'companies', companyId, 'outreachContacts');
      const q = query(contactsRef, orderBy('name'), limit(10));

      const snapshot = await getDocs(q);
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 10);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [currentUser, companyId]);

  const fetchMore = async () => {
    if (!currentUser || !companyId || !lastDoc || !hasMore) return;

    setLoading(true);
    try {
      const contactsRef = collection(db, 'companies', companyId, 'outreachContacts');
      const q = query(contactsRef, orderBy('name'), startAfter(lastDoc), limit(10));

      const snapshot = await getDocs(q);
      const newContactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(prev => [...prev, ...newContactsData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 10);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };


  useEffect(() => {
    initialFetch();
    // No need for onSnapshot here if using getDocs for pagination
    // If you need real-time updates AND pagination, it's more complex
    // and would involve listening to the initial query and managing new documents/changes manually.
    // For basic pagination, getDocs is sufficient.
  }, [currentUser, companyId, initialFetch]);

  // Consider if you need to reset state when companyId changes
   useEffect(() => {
    if (companyId) {
        setContacts([]); // Clear contacts on companyId change
        setLastDoc(null);
        setHasMore(true);
        setLoading(true);
        setError(null);
        initialFetch();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);


  return { contacts, loading, error, hasMore, fetchMore };
};

export default useOutreachContacts;