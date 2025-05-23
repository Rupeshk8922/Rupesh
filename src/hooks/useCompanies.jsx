import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthContext } from '../hooks/useauthContext';

// Utility to fetch company data by companyId
const fetchCompanyById = async (companyId) => {
  if (!companyId) return null;
  try {
    const q = query(collection(db, 'companies'), where('companyId', '==', companyId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      console.log('No company found with the specified companyId.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
};

// Hook that automatically fetches company data based on logged-in user's companyId
export const useFetchCompanyData = () => {
  const { user } = useAuthContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchCompanyById(user.companyId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [user?.companyId]);

  return { data, error, loading };
};

// Hook that fetches company data for any companyId, automatically if provided
export const useFetchCompanyDataById = (companyId) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchCompanyById(companyId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [companyId]);

  return { data, error, loading };
};
