import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [claims, setClaims] = useState(null); // Store custom claims

  useEffect(() => {
    console.log('AuthContext useEffect: Setting authLoading to true initially');
    setAuthLoading(true); // Ensure loading is true when effect runs
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('onAuthStateChanged fired with user:', currentUser);
      if (currentUser) {
        console.log('Authenticated user found.');
        try {
          console.log('Fetching ID token result...');
          const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh
          console.log('Successfully fetched ID token result.');
          setUser(currentUser);
          // Ensure new object reference for claims to trigger updates
          console.log("✅ Claims fetched in authContext:", idTokenResult.claims); // Log the actual object
        } catch (error) {
          console.error("❌ Error fetching claims in authContext:", error);
          setClaims(null);
        }
      } else {
        setClaims(null); // Clear claims if logged out
        console.log('No user found. Setting authLoading to false.');
      }
      // Set authLoading to false after the state change is processed
      setAuthLoading(false);
      console.log('AuthContext: Final setAuthLoading(false)');
    });

    return () => unsubscribe();
  }, []);

  // Check if authentication and claims are fully loaded
  // This determines when the application can start rendering protected routes/data
  // Changed condition to check for user existence as well
  const authIsFullyLoaded = !authLoading;

  const contextValue = useMemo(() => ({
    user,
    authLoading,
    authIsFullyLoaded,
    claims, // ✅ Now included properly
    userRole: claims?.role || null,
    // Providing companyId and subscriptionStatus directly for convenience
    companyId: claims?.companyId || null,
    subscriptionStatus: claims?.subscriptionStatus || null,
  }), [user, authLoading, claims]); // Dependencies are correct

  // Block rendering of children until authentication is fully loaded
  // This prevents components from trying to access data while auth state or claims are being determined
  if (authLoading) {
    return <div>🔐 Authenticating...</div>; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider'); 
  }
  console.log('useAuth hook returning authIsFullyLoaded:', context.authIsFullyLoaded);
  return context;
};
