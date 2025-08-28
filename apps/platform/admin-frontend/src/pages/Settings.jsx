import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';
import Layout from '../components/Layout';

const Settings = () => {
  const [settings, setSettings] = useState({ paymentGraceDays: 7 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setError('Failed to fetch settings');
      }
    } catch (err) {
      setError('Error loading settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('Settings saved successfully');
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Configure system-wide settings and preferences
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Payment Grace Period (Days)"
                  type="number"
                  value={settings.paymentGraceDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentGraceDays: parseInt(e.target.value) || 0
                  })}
                  helperText="Number of days after due date before tenant is deactivated"
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 365 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Grace Period Info
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Tenants will receive alerts when payments are overdue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • After grace period expires, tenants are automatically deactivated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Deactivated tenants cannot login until payment is made
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Settings;