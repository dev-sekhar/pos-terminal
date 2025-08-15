import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useUser } from "./UserContext";
import { authenticatedFetch } from "../utils/api";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false); // Start as false
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      if (user && user.role === "ADMIN") {
        setLoading(true);
        setError("");
        try {
          console.log(
            "[SettingsContext] Admin user detected, fetching settings..."
          );
          const data = await authenticatedFetch("/api/settings");
          console.log("[SettingsContext] Settings loaded successfully:", data);
          setSettings(data);
        } catch (err) {
          setError(err.message);
          console.error("Failed to load settings for ADMIN:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSettings(null);
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]); // The dependency on `user` is correct.

  const updateSettings = useCallback(
    async (newSettings) => {
      if (!user || user.role !== "ADMIN") {
        setError("Only Admins can update settings.");
        return;
      }
      try {
        const updated = await authenticatedFetch("/api/settings", {
          method: "PUT",
          body: JSON.stringify(newSettings),
        });
        setSettings(updated);
      } catch (err) {
        setError(err.message);
      }
    },
    [user]
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
