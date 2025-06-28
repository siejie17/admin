import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebaseConfig"; // Import Firebase config
import { getItem } from "../utils/localStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        // If Firebase user is null, check if we have admin data in localStorage
        if (!currentUser) {
          const adminData = await getItem("admin");
          if (adminData) {
            try {
              const parsedAdminData = JSON.parse(adminData);
              setUser(parsedAdminData);
            } catch (parseError) {
              console.error("Error parsing admin data:", parseError);
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          // If Firebase user exists, get admin data from localStorage
          const adminData = await getItem("admin");
          if (adminData) {
            try {
              const parsedAdminData = JSON.parse(adminData);
              setUser(parsedAdminData);
            } catch (parseError) {
              console.error("Error parsing admin data:", parseError);
              setUser(null);
            }
          } else {
            // If no admin data in localStorage but Firebase user exists,
            // we might need to fetch admin data or handle this case
            console.warn("Firebase user exists but no admin data in localStorage");
            setUser(null);
          }
        }
        
        // Mark auth as initialized after first check
        if (!authInitialized) {
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
        if (!authInitialized) {
          setAuthInitialized(true);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [authInitialized]);

  const value = {
    user,
    setUser,
    loading: loading || !authInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};