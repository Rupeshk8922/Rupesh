import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config'; // Assuming db is exported from your config

const useFetchCompanyUsers = (companyId) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const usersCollectionRef = collection(db, 'companies', companyId, 'users');
        const q = query(usersCollectionRef);
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company users:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [companyId]);

  return { users, loading, error };
};

export default useFetchCompanyUsers;