

import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import {
  db
} from '../firebase/config';
import {
  useAuthContext
} from '../hooks/useauthContext';


export const useFetchCompanyData = () => {
  const {
    user
  } = useAuthContext();

  const fetchCompanyData = async () => {
    if (!user || !user.companyId) {
      return null; // Or handle the case where user or companyId is missing
    }

    try {
      const q = query(collection(db, 'companies'), where('companyId', '==', user.companyId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        console.log('No company found with the specified companyId.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      throw error; // Re-throw the error for handling in the component
    }
  };

  return {
    fetchCompanyData
  };
};


// Custom hook for fetching company data by companyId
export const useFetchCompanyDataById = (companyId) => {
  const fetchCompanyData = async () => {
    if (!companyId) {
      return null; // Or handle the case where companyId is missing
    }

    try {
      const q = query(collection(db, 'companies'), where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        console.log('No company found with the specified companyId.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      throw error; // Re-throw the error for handling in the component
    }
  };

  return {
    fetchCompanyData
  };
};