import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore'; // Import firestore functions
import { auth, db } from "../firebase/config"; // your firebase config file
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Loading state for Firebase Auth
  const [userData, setUserData] = useState(null); // State for fetched user data (role, companyId, etc.)
  const [userDataLoading, setUserDataLoading] = useState(true); // Loading state for user data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Firebase Auth state is ready
      if (currentUser) {
        // If user is logged in, fetch their data
        setUserDataLoading(true);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            setUserData(null); // User document not found
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        } finally {
          setUserDataLoading(false); // User data fetch is complete
        }
      } else {
        // If no user, reset user data and loading state
        setUserData(null);
        setUserDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  // Determine if everything is fully loaded
  const authIsFullyLoaded = !authLoading && !userDataLoading;
  return (
    <AuthContext.Provider value={{
      user,
      authLoading, // Loading state for Firebase Auth (can be used if needed)
      userData, // Contains role, companyId, subscriptionStatus
      userDataLoading, // Loading state for fetching user data
      authIsFullyLoaded,
      userRole: userData?.role, // Expose role directly for convenience
      companyId: userData?.companyId, // Expose companyId
      subscriptionStatus: userData?.subscriptionStatus // Expose subscriptionStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
