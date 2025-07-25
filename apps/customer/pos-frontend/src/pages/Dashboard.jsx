import React, { useEffect, useState } from 'react';
import { Typography, Paper, Grid, Box, Alert, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTenant } from '../context/TenantContext';

// The initial state for our dashboard data
const initialMetrics = {
  totalToday: 0,
  mtdData: [],
  fytdData: [],
  topToday: [],
  topMonth: [],
  topYear: [],
  currency: 'USD',
};

const Dashboard = () => {
  const { tenant } = useTenant();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tenant) return;

    const fetchDashboardMetrics = async () => {
      setLoading(true);
      setError('');
      
      // Get the authentication token from where we stored it after login
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        // This is our new, efficient API endpoint
        const res = await fetch('/api/dashboard/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `Failed to fetch dashboard data`);
        }
        
        const data = await res.json();
        setMetrics(data);

      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [tenant]); // This effect runs whenever the tenant context changes

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {/* Row 1 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Total Sales Today</Typography>
            <Typography variant="h5">{metrics.currency} {metrics.totalToday.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Sales Chart (MTD)</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.mtdData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#1976d2" name="MTD Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Sales Chart (FYTD)</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.fytdData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#43a047" name="FYTD Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Row 2 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Top 5 Products Today</Typography>
            {metrics.topToday.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{metrics.currency} {p.value}</span>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Top 5 Products This Month</Typography>
            {metrics.topMonth.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{metrics.currency} {p.value}</span>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 220 }}>
            <Typography variant="subtitle1">Top 5 Products This Year</Typography>
            {metrics.topYear.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{metrics.currency} {p.value}</span>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;