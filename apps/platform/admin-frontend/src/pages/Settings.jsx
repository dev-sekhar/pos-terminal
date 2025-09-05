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
  const [units, setUnits] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editPlan, setEditPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [newPaymentType, setNewPaymentType] = useState('');
  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '' });

  useEffect(() => {
    fetchSettings();
    fetchPricingPlans();
    fetchUnits();
    fetchPaymentTypes();
    fetchCurrencies();
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

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/units', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      }
    } catch (err) {
      console.error('Error loading units:', err);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/payment-types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentTypes(data);
      }
    } catch (err) {
      console.error('Error loading payment types:', err);
    }
  };

  const addUnit = async () => {
    if (!newUnit.trim()) return;
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/units', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newUnit.trim() })
      });

      if (response.ok) {
        setNewUnit('');
        fetchUnits();
        setMessage('Unit added successfully');
      } else {
        setError('Failed to add unit');
      }
    } catch (err) {
      setError('Error adding unit');
    }
  };

  const addPaymentType = async () => {
    if (!newPaymentType.trim()) return;
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/payment-types', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newPaymentType.trim() })
      });

      if (response.ok) {
        setNewPaymentType('');
        fetchPaymentTypes();
        setMessage('Payment type added successfully');
      } else {
        setError('Failed to add payment type');
      }
    } catch (err) {
      setError('Error adding payment type');
    }
  };

  const fetchCurrencies = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/currencies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrencies(data);
      }
    } catch (err) {
      console.error('Error loading currencies:', err);
    }
  };

  const addCurrency = async () => {
    if (!newCurrency.code.trim() || !newCurrency.name.trim() || !newCurrency.symbol.trim()) return;
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/currencies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: newCurrency.code.trim().toUpperCase(),
          name: newCurrency.name.trim(),
          symbol: newCurrency.symbol.trim()
        })
      });

      if (response.ok) {
        setNewCurrency({ code: '', name: '', symbol: '' });
        fetchCurrencies();
        setMessage('Currency added successfully');
      } else {
        setError('Failed to add currency');
      }
    } catch (err) {
      setError('Error adding currency');
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
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Grace Periods
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
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
                      inputProps={{ min: 0, max: 365 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                      inputProps={{ min: 0, max: 365 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                      inputProps={{ min: 0, max: 365 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Units of Measurement
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add new unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUnit()}
                  />
                  <Button variant="contained" onClick={addUnit} disabled={!newUnit.trim()}>
                    Add
                  </Button>
                </Box>
                <TableContainer sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Unit</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {units.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell>{unit.name}</TableCell>
                          <TableCell>{unit.active ? 'Active' : 'Inactive'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Types
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add new payment type"
                    value={newPaymentType}
                    onChange={(e) => setNewPaymentType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPaymentType()}
                  />
                  <Button variant="contained" onClick={addPaymentType} disabled={!newPaymentType.trim()}>
                    Add
                  </Button>
                </Box>
                <TableContainer sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.name}</TableCell>
                          <TableCell>{type.active ? 'Active' : 'Inactive'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Currencies
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      placeholder="Code (USD)"
                      value={newCurrency.code}
                      onChange={(e) => setNewCurrency({...newCurrency, code: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      placeholder="Name"
                      value={newCurrency.name}
                      onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      size="small"
                      placeholder="$"
                      value={newCurrency.symbol}
                      onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button variant="contained" onClick={addCurrency} disabled={!newCurrency.code.trim()}>
                      Add
                    </Button>
                  </Grid>
                </Grid>
                <TableContainer sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Symbol</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currencies.map((currency) => (
                        <TableRow key={currency.id}>
                          <TableCell>{currency.code}</TableCell>
                          <TableCell>{currency.name}</TableCell>
                          <TableCell>{currency.symbol}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                    {currencies.map((currency) => (
                      <MenuItem key={currency.id} value={currency.code}>
                        {currency.code} - {currency.name}
                      </MenuItem>
                    ))}
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