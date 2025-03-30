import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig"; // Import Firebase config

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);