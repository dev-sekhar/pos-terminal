import React from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { useSettings } from '../context/SettingsContext'; // 1. IMPORT THE HOOK

const Reports = () => {
  // 2. USE THE SETTINGS FROM THE CONTEXT
  const { settings, loading, error } = useSettings();

  // 3. ADD ROBUST LOADING AND ERROR GUARDS
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!settings) return <Alert severity="warning">Could not load tenant settings.</Alert>;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Grid container spacing={2}>
        {/* Corrected Grid v2 syntax */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2, width: '100%', mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1">Total Sales Today</Typography>
            {/* 4. USE THE CURRENCY FROM THE SETTINGS */}
            <Typography variant="h6">{settings.currency} 2,300</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2, width: '100%', mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1">Total Purchases This Week</Typography>
            <Typography variant="h6">{settings.currency} 4,800</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2, width: '100%' }}>
            <Typography variant="subtitle1">Low Stock Items</Typography>
            <Typography variant="h6">7</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;