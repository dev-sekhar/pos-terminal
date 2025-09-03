import React from 'react';
import { Typography, Box } from '@mui/material';
import Layout from '../components/Layout';

const Reports = () => {
  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1">
          System reports and analytics will be displayed here.
        </Typography>
      </Box>
    </Layout>
  );
};

export default Reports;