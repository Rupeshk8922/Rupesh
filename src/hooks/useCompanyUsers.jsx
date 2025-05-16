import { useState, useEffect } from 'react';
import { db } from '../firebase'; // Your Firebase initialization
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useauthContext } from '../contexts/authContext';
import { useAuth } from '../contexts/authContext.jsx';

const useCompanyUsers = () => {const { currentUser, companyId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !companyId) {
      setLoading(false);
      setUsers([]);
      return;
    }

    const usersRef = collection(db, 'companies', companyId, 'users');
    const q = query(usersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching company users:", err);
      setError(err);
      setLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, [currentUser, companyId]);

  return { users, loading, error };
}

export default useCompanyUsers;