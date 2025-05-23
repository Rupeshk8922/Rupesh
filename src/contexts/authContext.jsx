import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    setAuthLoading(true);

    // This handles initial sign-in/sign-out state
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("onAuthStateChanged fired:", currentUser);
      if (currentUser) {
        setUser(currentUser);
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh
          setClaims(idTokenResult.claims);
          console.log("✅ Claims fetched (initial):", idTokenResult.claims);
        } catch (error) {
          console.error("❌ Error fetching claims (initial):", error);
          setClaims(null);
        }
      } else {
        setUser(null);
        setClaims(null);
      }
      setAuthLoading(false);
    });

    // This listens for ID token changes (e.g., token refresh every hour)
    // and updates claims accordingly *without* user sign out/in
    const unsubscribeIdToken = onIdTokenChanged(auth, async (currentUser) => {
      console.log("onIdTokenChanged fired:", currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          setClaims(idTokenResult.claims);
          console.log("🔄 Claims refreshed:", idTokenResult.claims);
        } catch (error) {
          console.error("❌ Error refreshing claims:", error);
          setClaims(null);
        }
      } else {
        // User logged out, clear everything
        setUser(null);
        setClaims(null);
      }
    });

    // Cleanup both listeners on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeIdToken();
    };
  }, []);

  const authIsFullyLoaded = !authLoading;

  const contextValue = useMemo(
    () => ({
      user,
      authLoading,
      authIsFullyLoaded,
      claims,
      userRole: claims?.role || null,
      companyId: claims?.companyId || null,
      subscriptionStatus: claims?.subscriptionStatus || null,
    }),
    [user, authLoading, claims]
  );

  if (authLoading) {
    return <div>🔐 Authenticating...</div>;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
