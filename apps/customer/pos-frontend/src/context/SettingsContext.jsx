import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token found");
    const response = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errData.message);
    }
    return response.json();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setSettings(null); // Clear settings on logout
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await callApi('/api/settings');
        console.log("✅ Settings loaded successfully in context:", data);
        setSettings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user, callApi]);

  // This function allows the Settings page to update the context and the backend
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const updated = await callApi('/api/settings', { method: 'PUT', body: JSON.stringify(newSettings) });
      setSettings(updated); // Update the state with the response from the server
    } catch (err) {
      setError(err.message);
      // Optionally re-fetch to revert optimistic update
    }
  }, [callApi]);

  // useMemo prevents unnecessary re-renders of all consuming components
  const value = useMemo(() => ({
    settings,
    updateSettings, // Provide the update function to components
    loading,
    error,
  }), [settings, updateSettings, loading, error]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};