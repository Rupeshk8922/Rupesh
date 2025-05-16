import { useState, useEffect } from 'react'; // The original code already has this import. No change needed here.

export const useFetchCompanyData = () => {
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Corrected syntax
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setCompanyData({ name: 'Example Company', id: '123' }); // Replace with actual data structure
      setIsLoading(false);
      setError(null);
    }, 1000); // Simulate a 1-second delay
  }, []); // Empty dependency array means this effect runs once on mount

  return { companyData, isLoading, error };
};
