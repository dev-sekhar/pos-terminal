import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { ArrowBack, Receipt, ChangeCircle } from '@mui/icons-material';
import Layout from '../components/Layout';

const Billing = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changePlanDialog, setChangePlanDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activationDate, setActivationDate] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [billingPeriodStart, setBillingPeriodStart] = useState('');
  const [billingPeriodEnd, setBillingPeriodEnd] = useState('');

  useEffect(() => {
    fetchBillingData();
    fetchPricingPlans();
    fetchAllTenants();
  }, [tenantId]);

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(`http://localhost:5002/api/tenants/${tenantId}/billing`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG - Billing data received:', data);
        setBillingData(data);
      } else {
        setError('Failed to fetch billing data');
      }
    } catch (err) {
      setError('Error loading billing data');
    } finally {
      setLoading(false);
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
      console.error('Error fetching pricing plans:', err);
    }
  };

  const fetchAllTenants = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllTenants(data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const changePlan = async () => {
    console.log('DEBUG - Change plan called with:', { selectedPlan, activationDate });
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(`http://localhost:5002/api/tenants/${tenantId}/change-plan`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPlanId: selectedPlan,
          activationDate
        })
      });

      console.log('DEBUG - Change plan response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Change plan result:', result);
        setSnackbar({ open: true, message: 'Plan change scheduled successfully', severity: 'success' });
        setChangePlanDialog(false);
        fetchBillingData();
      } else {
        const errorData = await response.json();
        console.log('DEBUG - Change plan error:', errorData);
        setSnackbar({ open: true, message: errorData.message || 'Failed to change plan', severity: 'error' });
      }
    } catch (err) {
      console.log('DEBUG - Change plan exception:', err);
      setSnackbar({ open: true, message: 'Error changing plan', severity: 'error' });
    }
  };

  const generateInvoice = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const targetTenantId = selectedTenant || tenantId;
      const response = await fetch(`http://localhost:5002/api/tenants/${targetTenantId}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          billingPeriodStart,
          billingPeriodEnd
        })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Invoice generated successfully', severity: 'success' });
        setInvoiceDialog(false);
        fetchBillingData();
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Failed to generate invoice', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error generating invoice', severity: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/tenants')}
              sx={{ mr: 2 }}
            >
              Back to Tenants
            </Button>
            <Typography variant="h4">
              Billing - {billingData?.tenant?.name}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ChangeCircle />}
              onClick={() => setChangePlanDialog(true)}
              sx={{ mr: 2 }}
            >
              Change Plan
            </Button>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={() => {
                console.log('Generate Invoice button clicked!');
                setInvoiceDialog(true);
              }}
              sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
            >
              Generate Invoice
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Outstanding
                </Typography>
                <Typography variant="h4" color="error">
                  ${billingData?.totalDue?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Plan
                </Typography>
                <Typography variant="h5">
                  {billingData?.tenant?.pricingPlan?.name || 'No Plan'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {billingData?.tenant?.pricingPlan?.price === null ? 'Contact Us' : billingData?.tenant?.pricingPlan?.price === 0 ? 'Free' : `${billingData?.tenant?.pricingPlan?.currency === 'USD' ? '$' : billingData?.tenant?.pricingPlan?.currency}${billingData?.tenant?.pricingPlan?.price}/${billingData?.tenant?.pricingPlan?.paymentFrequency}`}
                </Typography>
                {billingData?.tenant?.currentPlanStartDate && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Started: {new Date(billingData.tenant.currentPlanStartDate).toLocaleDateString()}
                  </Typography>
                )}
                {(() => {
                  const endDate = billingData?.tenant?.currentPlanEndDate;
                  console.log('DEBUG - End date value:', endDate, 'Type:', typeof endDate);
                  const shouldShow = endDate && endDate !== null && endDate !== 'null' && endDate !== '1970-01-01T00:00:00.000Z';
                  console.log('DEBUG - Should show end date:', shouldShow);
                  return shouldShow;
                })() && (
                  <Typography variant="caption" display="block">
                    Ends: {new Date(billingData.tenant.currentPlanEndDate).toLocaleDateString()}
                  </Typography>
                )}
                {billingData?.tenant?.nextPlanId && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="caption" display="block" color="info.contrastText">
                      Next Plan: {billingData.tenant.nextPlan?.name}
                    </Typography>
                    {billingData?.tenant?.nextPlanActivationDate && (
                      <Typography variant="caption" display="block" color="info.contrastText">
                        Activates: {new Date(billingData.tenant.nextPlanActivationDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Invoices
                </Typography>
                <Typography variant="h4">
                  {billingData?.invoices?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Invoice History
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Payments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billingData?.invoices?.map((invoice) => {
                  const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>#{invoice.id}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={invoice.status} 
                          size="small"
                          color={getStatusColor(invoice.status)}
                        />
                      </TableCell>
                      <TableCell>{invoice.description || 'Monthly subscription'}</TableCell>
                      <TableCell>
                        {invoice.payments.length > 0 ? (
                          <Box>
                            <Typography variant="body2">
                              ${totalPaid.toFixed(2)} paid
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {invoice.payments.length} payment(s)
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No payments
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {(!billingData?.invoices || billingData.invoices.length === 0) && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No invoices found for this tenant
              </Typography>
            </Box>
          )}
        </Paper>
        
        <Dialog open={invoiceDialog} onClose={() => setInvoiceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Tenant</InputLabel>
              <Select
                value={selectedTenant || tenantId}
                onChange={(e) => setSelectedTenant(e.target.value)}
                label="Select Tenant"
              >
                {allTenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.pricingPlan?.name || 'No Plan'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Billing Period Start"
              type="date"
              value={billingPeriodStart}
              onChange={(e) => setBillingPeriodStart(e.target.value)}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Billing Period End"
              type="date"
              value={billingPeriodEnd}
              onChange={(e) => setBillingPeriodEnd(e.target.value)}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvoiceDialog(false)}>Cancel</Button>
            <Button 
              onClick={generateInvoice} 
              variant="contained" 
              disabled={generating || !selectedTenant}
            >
              {generating ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={changePlanDialog} onClose={() => setChangePlanDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Plan</InputLabel>
              <Select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                label="New Plan"
              >
                {pricingPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.price === null ? 'Contact Us' : plan.price === 0 ? 'Free' : `$${plan.price}/${plan.paymentFrequency}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Activation Date"
              type="date"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePlanDialog(false)}>Cancel</Button>
            <Button onClick={changePlan} variant="contained" disabled={!selectedPlan || !activationDate}>
              Schedule Change
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Billing;