import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/api"; // Use our utility

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Add a loading state to prevent rendering the app before validation is complete
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    console.log("Clearing session and logging out.");
    localStorage.clear();
    setUser(null);
    window.location.href = 'http://lvh.me:3000/';
  };

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Use our new /profile endpoint to validate the token
          const userData = await authenticatedFetch("/api/auth/profile");
          console.log("Session validated successfully:", userData);
          setUser(userData); // Set user with fresh data from backend
        } catch (error) {
          console.warn(
            "Session validation failed. Token is invalid or expired."
          );
          logout(); // If it fails, clear the invalid data
        }
      }
      // We are done checking, whether we found a token or not.
      setLoading(false);
    };

    validateSession();
  }, []); // The empty dependency array means this runs only ONCE on initial app load

  // While checking the session, show a loading indicator or blank screen
  if (loading) {
    return null; // Or <CircularProgress />
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
