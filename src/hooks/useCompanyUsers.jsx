import { useState, useEffect } from 'react';
import { db } from '../firebase/config';  // adjust as needed
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuthContext } from '../contexts/authContext';  // fixed import casing

const useCompanyUsers = () => {
  const { currentUser, companyId } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !companyId) {
      setLoading(false);
      setUsers([]);
      setError(null);  // reset error on early exit
      return;
    }

    const usersRef = collection(db, 'companies', companyId, 'users');
    const q = query(usersRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
        setError(null); // clear previous errors on success
      },
      (err) => {
        console.error("Error fetching company users:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, companyId]);

  return { users, loading, error };
};

export default useCompanyUsers;
