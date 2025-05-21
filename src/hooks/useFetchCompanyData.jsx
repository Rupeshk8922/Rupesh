import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useFetchCompanyData(companyId) {
  const [company, setCompany] = useState(null);
  const [companyDataLoading, setCompanyDataLoading] = useState(true);

  useEffect(() => {
    setCompanyDataLoading(true); // Set loading to true when effect runs
    console.log("🔥 useFetchCompanyData effect running for companyId:", companyId);
    if (!companyId) {
      console.log("🔥 useFetchCompanyData: Invalid companyId, exiting effect.");
      setCompanyDataLoading(false);
      return;
    }
    
    const fetchCompany = async () => {
      try {
        const companyRef = doc(db, "companies", companyId);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          setCompany(companySnap.data());
        } else {
          console.warn("❗ No such company in DB for ID:", companyId);
        }
      } catch (err) {
        console.error("❌ Error fetching company data:", err);
      } finally {
        setCompanyDataLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  return { company, companyDataLoading };
}
