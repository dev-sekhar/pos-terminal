import { Box, Typography, Paper, Grid } from '@mui/material';
import React from 'react';

const Reports = () => {
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, width: '100%', mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1">Total Sales Today</Typography>
            <Typography variant="h6">₹2,300</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, width: '100%', mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1">Total Purchases This Week</Typography>
            <Typography variant="h6">₹4,800</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
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
