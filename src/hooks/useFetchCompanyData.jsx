import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Verify your firebase config import

const useFetchCompanyData = (companyId) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCompanyData = async () => {
      if (!companyId) {
        if (isMounted) {
          setCompanyData(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const companyDocRef = doc(db, 'companies', companyId);
        const companyDocSnap = await getDoc(companyDocRef);

        if (isMounted) {
          if (companyDocSnap.exists()) {
            setCompanyData(companyDocSnap.data());
          } else {
            setCompanyData(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching company data:', err);
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchCompanyData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  return { companyData, loading, error };
};

export default useFetchCompanyData;
