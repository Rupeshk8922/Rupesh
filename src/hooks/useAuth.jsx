import { useState, useEffect, useContext, createContext } from 'react';
import { auth } from '../firebase/config'; // Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({
  user: null,
  companyId: null,
  loading: true,
});

/**
 * Custom hook to access authentication context.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Provider component to manage Firebase auth state and provide it via context.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          setCompanyId(idTokenResult.claims.companyId || null);
        } catch (error) {
          console.error('Error fetching user claims:', error);
          setCompanyId(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setCompanyId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, companyId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
