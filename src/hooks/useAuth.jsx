import { useState, useEffect, useContext, createContext } from 'react';
import { auth } from '../firebase/config'; // Assuming firebase config is here
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null); // Assuming you have an AuthContext

export const useAuth = () => {
  const context = useContext(AuthContext); // Use the context here
  const [user, setUser] = useState(context?.user || null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Fetch fresh claims
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          // Assuming companyId is stored in custom claims
          setCompanyId(idTokenResult.claims.companyId || null);
        } catch (error) {
          console.error('Error fetching user claims:', error);
          setCompanyId(null); // Ensure companyId is null on error
        } finally {
          setLoading(false); // Set loading to false after claims are processed
        }
      } else {
        setUser(null);
        setCompanyId(null);
        setLoading(false); // Set loading to false when no user
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, companyId, loading };
};

// Export the context provider
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};