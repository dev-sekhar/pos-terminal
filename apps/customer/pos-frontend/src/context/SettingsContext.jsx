import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useUser } from "./UserContext";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false); // Default to false
  const [error, setError] = useState("");

  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errData = await response
        .json()
        .catch(() => ({ message: "An unknown error occurred" }));
      throw new Error(errData.message);
    }
    return response.json();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      // --- THIS IS THE FIX ---
      // 1. Define which roles are allowed to even try fetching settings.
      const allowedRoles = ["ADMIN", "MANAGER"];

      // 2. Check the user's role. If they are not logged in or not in an allowed role, do nothing.
      if (!user || !allowedRoles.includes(user.role)) {
        setSettings(null); // Ensure settings are cleared for unauthorized roles
        setLoading(false);
        return; // Exit early
      }
      // --- END OF FIX ---

      setLoading(true);
      setError("");
      try {
        const data = await callApi("/api/settings");
        console.log(
          "✅ Settings loaded successfully for authorized user:",
          data
        );
        setSettings(data);
      } catch (err) {
        setError(err.message);
        console.error("❌ Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user, callApi]);

  const updateSettings = useCallback(
    async (newSettings) => {
      try {
        const updated = await callApi("/api/settings", {
          method: "PUT",
          body: JSON.stringify(newSettings),
        });
        setSettings(updated);
      } catch (err) {
        setError(err.message);
      }
    },
    [callApi]
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      loading,
      error,
    }),
    [settings, updateSettings, loading, error]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
