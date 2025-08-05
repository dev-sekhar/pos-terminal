import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useUser } from "./UserContext";
// --- FIX 1: Import our centralized API utility ---
import { authenticatedFetch } from "../utils/api";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true on initial load
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      // --- THIS IS YOUR CORRECTED LOGIC ---
      // 1. Only ADMINs should ever attempt to fetch settings.
      if (!user || user.role !== "ADMIN") {
        setSettings(null); // Ensure settings are null for non-admins
        setLoading(false);
        return; // Exit immediately
      }

      setLoading(true);
      setError("");
      try {
        // 2. Use authenticatedFetch for the API call.
        const data = await authenticatedFetch("/api/settings");
        console.log("Settings loaded successfully for ADMIN:", data);
        setSettings(data);
      } catch (err) {
        // An error here is a real problem, because an ADMIN should have access.
        setError(err.message);
        console.error("Failed to load settings for ADMIN:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]); // Re-evaluate whenever the user changes

  const updateSettings = useCallback(
    async (newSettings) => {
      // This check is a safeguard, but the UI should prevent this from being called by non-admins.
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
    [user] // Dependency on user for the permission check
  );

  const value = useMemo(
    () => ({ settings, updateSettings, loading, error }),
    [settings, updateSettings, loading, error]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
