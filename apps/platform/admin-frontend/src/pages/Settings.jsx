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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, Edit } from '@mui/icons-material';
import Layout from '../components/Layout';

const Settings = () => {
  const [settings, setSettings] = useState({ 
    paymentGraceDays: 7,
    readOnlyGraceDays: 14,
    loginBlockGraceDays: 21
  });
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editPlan, setEditPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPricingPlans();
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

  const fetchPricingPlans = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/pricing-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPricingPlans(data);
      }
    } catch (err) {
      console.error('Error loading pricing plans:', err);
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
        body: JSON.stringify({
          paymentGraceDays: settings.paymentGraceDays,
          readOnlyGraceDays: settings.readOnlyGraceDays,
          loginBlockGraceDays: settings.loginBlockGraceDays
        })
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

  const handleEditPlan = (plan) => {
    setEditPlan({ ...plan });
    setOpenDialog(true);
  };

  const handleSavePlan = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(`http://localhost:5002/api/pricing-plans/${editPlan.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editPlan)
      });

      if (response.ok) {
        setMessage('Pricing plan updated successfully');
        setOpenDialog(false);
        fetchPricingPlans();
      } else {
        setError('Failed to update pricing plan');
      }
    } catch (err) {
      setError('Error updating pricing plan');
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
                  Payment Grace Periods
                </Typography>
                <TextField
                  fullWidth
                  label="Normal Functioning Period (Days)"
                  type="number"
                  value={settings.paymentGraceDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentGraceDays: parseInt(e.target.value) || 0
                  })}
                  helperText="Days after due date with full system access"
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 365 }}
                />
                <TextField
                  fullWidth
                  label="Read-Only Period (Days)"
                  type="number"
                  value={settings.readOnlyGraceDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    readOnlyGraceDays: parseInt(e.target.value) || 0
                  })}
                  helperText="Days after due date with view-only access (no add/edit)"
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 365 }}
                />
                <TextField
                  fullWidth
                  label="Login Block Period (Days)"
                  type="number"
                  value={settings.loginBlockGraceDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    loginBlockGraceDays: parseInt(e.target.value) || 0
                  })}
                  helperText="Days after due date when login is completely blocked"
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
                  Grace Period Stages
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Stage 1:</strong> Normal functioning with payment alerts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Stage 2:</strong> Read-only access (no sales, purchases, or product management)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Stage 3:</strong> Complete login block with support contact message
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pricing Plans Management
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Plan Name</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Max Users</TableCell>
                        <TableCell>Max Branches</TableCell>
                        <TableCell>Max Products</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pricingPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell>{plan.name}</TableCell>
                          <TableCell>{plan.price === null ? 'Contact Us' : plan.price === 0 ? 'Free' : plan.price}</TableCell>
                          <TableCell>{plan.currency}</TableCell>
                          <TableCell>{plan.maxUsers === null ? 'Unlimited' : plan.maxUsers}</TableCell>
                          <TableCell>{plan.maxBranches === null ? 'Unlimited' : plan.maxBranches}</TableCell>
                          <TableCell>{plan.maxProducts === null ? 'Unlimited' : plan.maxProducts}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditPlan(plan)}>
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Pricing Plan</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  value={editPlan?.name || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={editPlan?.price || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, price: e.target.value ? parseFloat(e.target.value) : null })}
                  helperText="Leave empty for 'Contact Us'"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={editPlan?.currency || 'USD'}
                    onChange={(e) => setEditPlan({ ...editPlan, currency: e.target.value })}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Max Users"
                  type="number"
                  value={editPlan?.maxUsers || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, maxUsers: e.target.value ? parseInt(e.target.value) : null })}
                  helperText="Empty = Unlimited"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Max Branches"
                  type="number"
                  value={editPlan?.maxBranches || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, maxBranches: e.target.value ? parseInt(e.target.value) : null })}
                  helperText="Empty = Unlimited"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Max Products"
                  type="number"
                  value={editPlan?.maxProducts || ''}
                  onChange={(e) => setEditPlan({ ...editPlan, maxProducts: e.target.value ? parseInt(e.target.value) : null })}
                  helperText="Empty = Unlimited"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Settings;