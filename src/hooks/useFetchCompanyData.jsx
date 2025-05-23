import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useFetchCompanyData(companyId) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompany = useCallback(async () => {
    if (!companyId) {
      console.log("🔥 useFetchCompanyData: Invalid companyId, skipping fetch.");
      setCompany(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const companyRef = doc(db, "companies", companyId);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        setCompany(companySnap.data());
      } else {
        setCompany(null);
        setError(`Company with ID ${companyId} does not exist.`);
        console.warn("❗ No such company in DB for ID:", companyId);
      }
    } catch (err) {
      setCompany(null);
      setError(err.message || "Failed to fetch company data.");
      console.error("❌ Error fetching company data:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    companyData: company,
    loading,
    error,
    refetchCompanyData: fetchCompany,
  };
}
