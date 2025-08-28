import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Typography
} from '@mui/material';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome to the system administration portal
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {user?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {user?.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {user?.role}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> System Administrator
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System statistics and management tools coming soon...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard;