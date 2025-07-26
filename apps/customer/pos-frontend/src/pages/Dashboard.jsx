import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Paper, Grid, Box, Alert, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTenant } from '../context/TenantContext';
import { useSettings } from '../context/SettingsContext';

// --- THIS IS THE FIX (Part 1) ---
// Provide a safe, complete initial state that matches the structure of the API response.
const initialMetrics = {
  totalToday: 0,
  mtdData: [],
  fytdData: [],
  topToday: [],
  topMonth: [],
  topYear: [],
};

const Dashboard = () => {
  const { tenant } = useTenant();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();
  
  // Use the safe initial state
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard data' }));
      throw new Error(errData.message);
    }
    return response.json();
  }, []);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!tenant) return;
      setLoading(true);
      setError('');
      try {
        const data = await callApi('/api/dashboard/metrics');
        setMetrics(data); // The API response will replace the initial state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardMetrics();
  }, [tenant, callApi]);

  // --- THIS IS THE FIX (Part 2) ---
  // A single, robust guard at the top handles all loading and error states.
  if (loading || settingsLoading) return <CircularProgress />;
  if (error || settingsError) return <Alert severity="error">{error || settingsError}</Alert>;
  if (!settings || !metrics) return <Alert severity="warning">Could not load dashboard data or settings.</Alert>;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Total Sales Today</Typography>
            {/* We can now safely access metrics properties because of the guards above */}
            <Typography variant="h5">{settings.currency} {metrics.totalToday.toFixed(2)}</Typography>
        </Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Sales Chart (MTD)</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.mtdData}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="sales" fill="#1976d2" name="MTD Sales" /></BarChart>
            </ResponsiveContainer>
        </Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Sales Chart (FYTD)</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.fytdData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="sales" fill="#43a047" name="FYTD Sales" /></BarChart>
            </ResponsiveContainer>
        </Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Top 5 Products Today</Typography>
            {metrics.topToday.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{settings.currency} {p.value}</span>
              </Box>
            ))}
        </Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Top 5 Products This Month</Typography>
            {metrics.topMonth.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{settings.currency} {p.value}</span>
              </Box>
            ))}
        </Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Top 5 Products This Year</Typography>
            {metrics.topYear.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{settings.currency} {p.value}</span>
              </Box>
            ))}
        </Paper></Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;