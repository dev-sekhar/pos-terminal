import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import { authenticatedFetch } from '../utils/api';
import { useTenant } from '../context/TenantContext';
import { useUser } from '../context/UserContext';
import { getUserPermissions, PERMISSIONS } from '@pos-terminal/permissions';

// Currency formatting utility with conversion info
const formatCurrency = (amount, tenantSettings, convertedData = null) => {
  console.log('=== FORMAT CURRENCY DEBUG ===');
  console.log('Amount:', amount);
  console.log('Tenant Settings:', tenantSettings);
  console.log('Converted Data:', convertedData);
  
  const currency = tenantSettings?.currency || 'USD';
  console.log('Currency:', currency);
  
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹'
  };
  const symbol = currencySymbols[currency] || currency;
  console.log('Symbol:', symbol);
  
  if (convertedData && currency !== 'USD') {
    console.log('Using converted data');
    const result = {
      display: `${symbol}${convertedData.convertedAmount.toFixed(2)}`,
      rateInfo: `Rate: 1 USD = ${convertedData.exchangeRate.rate.toFixed(4)} ${currency}, ${convertedData.exchangeRate.date}`
    };
    console.log('Converted Result:', result);
    console.log('=== END FORMAT DEBUG ===');
    return result;
  }
  
  console.log('Using original amount');
  const result = {
    display: `${symbol}${amount.toFixed(2)}`,
    rateInfo: null
  };
  console.log('Original Result:', result);
  console.log('=== END FORMAT DEBUG ===');
  return result;
};

// For Stripe integration (frontend)
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const Billing = () => {
  const { tenant } = useTenant();
  const { user } = useUser();
  
  // Check if user has billing permissions
  const userPermissions = getUserPermissions(user?.role);
  const canAccessBilling = userPermissions.includes(PERMISSIONS.MANAGE_BILLING);
  
  if (!canAccessBilling) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access Denied: You do not have permission to view billing information. Only administrators can access this page.
        </Alert>
      </Box>
    );
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPlanDetails, setCurrentPlanDetails] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, invoice: null });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [tenantSettings, setTenantSettings] = useState(null);

  const handleMakePayment = async (invoiceId, amount) => {
    try {
      await authenticatedFetch('/api/billing/make-payment', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId,
          amount,
          method: 'CARD'
        })
      });
      // Refresh billing data
      const historyData = await authenticatedFetch('/api/billing/history');
      setBillingHistory(historyData);
      const outstanding = historyData.filter(invoice => 
        invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
      );
      setOutstandingInvoices(outstanding);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!tenant || !user) return;
      setLoading(true);
      setError('');
      try {
        // Fetch current plan details
        const currentPlanData = await authenticatedFetch('/api/billing/current-plan');
        setCurrentPlanDetails(currentPlanData);

        // Fetch billing history
        const historyData = await authenticatedFetch('/api/billing/history');
        console.log('=== FRONTEND BILLING DEBUG ===');
        console.log('Billing History Data:', historyData);
        setBillingHistory(historyData);
        
        // Fetch tenant settings for currency
        const settingsData = await authenticatedFetch('/api/settings');
        console.log('Tenant Settings Data:', settingsData);
        setTenantSettings(settingsData);
        console.log('=== END FRONTEND DEBUG ===');
        
        // Filter outstanding invoices
        const outstanding = historyData.filter(invoice => 
          invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
        );
        setOutstandingInvoices(outstanding);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenant, user]);



  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;



  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Billing History</Typography>

      {/* Current Plan and Outstanding */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Your Current Plan</Typography>
            {currentPlanDetails?.currentPlan ? (
              <>
                <Typography variant="h6">{currentPlanDetails.currentPlan.name}</Typography>
                <Typography>Price: {currentPlanDetails.currentPlan.price === null ? 'Contact Us' : currentPlanDetails.currentPlan.price === 0 ? 'Free' : `${currentPlanDetails.currentPlan.currency === 'USD' ? '$' : currentPlanDetails.currentPlan.currency}${currentPlanDetails.currentPlan.price}/${currentPlanDetails.currentPlan.paymentFrequency}`}</Typography>
                {currentPlanDetails.currentPlanStartDate && (
                  <Typography>Started: {new Date(currentPlanDetails.currentPlanStartDate).toLocaleDateString()}</Typography>
                )}
                {currentPlanDetails.currentPlanEndDate && 
                 currentPlanDetails.currentPlanEndDate !== null && 
                 new Date(currentPlanDetails.currentPlanEndDate).getFullYear() > 1970 && (
                  <Typography>Ends: {new Date(currentPlanDetails.currentPlanEndDate).toLocaleDateString()}</Typography>
                )}
                {currentPlanDetails.nextPlan && currentPlanDetails.nextPlanActivationDate && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Plan change to <strong>{currentPlanDetails.nextPlan.name}</strong> scheduled for {new Date(currentPlanDetails.nextPlanActivationDate).toLocaleDateString()}.
                  </Alert>
                )}
              </>
            ) : (
              <Typography>No active plan. Please subscribe to one below.</Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {(() => {
            const totalOutstanding = outstandingInvoices.reduce((total, invoice) => {
              const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
              return total + (invoice.amount - totalPaid);
            }, 0);
            const hasOutstanding = totalOutstanding > 0;
            
            return (
              <Card sx={{ 
                border: 2, 
                borderColor: hasOutstanding ? 'error.main' : 'success.main', 
                height: '100%' 
              }}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    color={hasOutstanding ? 'error' : 'success.main'} 
                    gutterBottom
                  >
                    Outstanding Balance
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color={hasOutstanding ? 'error' : 'success.main'}
                  >
                    {(() => {
                      const totalConverted = outstandingInvoices.reduce((total, invoice) => {
                        const convertedAmount = invoice.convertedAmount?.convertedAmount || invoice.amount;
                        const totalPaid = (invoice.payments || []).reduce((sum, payment) => {
                          return sum + (payment.convertedAmount?.convertedAmount || payment.amount);
                        }, 0);
                        return total + (convertedAmount - totalPaid);
                      }, 0);
                      const formatted = formatCurrency(totalConverted, tenantSettings);
                      return formatted.display;
                    })()}
                  </Typography>
                  <Typography variant="body2">
                    {hasOutstanding 
                      ? `${outstandingInvoices.length} unpaid invoice(s)` 
                      : 'All invoices paid'
                    }
                  </Typography>
                </CardContent>
              </Card>
            );
          })()}
        </Grid>
      </Grid>

      {/* Outstanding Payments */}
      {outstandingInvoices.length > 0 && (
        <Paper id="outstanding-payments" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Outstanding Payments</Typography>
          <Grid container spacing={2}>
            {outstandingInvoices.map((invoice) => {
              const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
              const amountDue = invoice.amount - totalPaid;
              return (
                <Grid item xs={12} sm={6} md={4} key={invoice.id}>
                  <Card sx={{ border: 1, borderColor: 'error.main' }}>
                    <CardContent>
                      <Typography variant="h6">Invoice #{invoice.id}</Typography>
                      <Box sx={{ color: 'error.main', typography: 'h5' }}>
                        {(() => {
                          const convertedAmountDue = (invoice.convertedAmount?.convertedAmount || invoice.amount) - 
                            (invoice.payments || []).reduce((sum, payment) => 
                              sum + (payment.convertedAmount?.convertedAmount || payment.amount), 0);
                          const formatted = formatCurrency(convertedAmountDue, tenantSettings, invoice.convertedAmount);
                          return (
                            <>
                              <div>{formatted.display}</div>
                              {formatted.rateInfo && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {formatted.rateInfo}
                                </Typography>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                      <Typography variant="body2">Due: {new Date(invoice.dueDate).toLocaleDateString()}</Typography>
                      <Typography variant="body2">{invoice.description}</Typography>
                      <Button 
                        variant="contained" 
                        color={amountDue > 0 ? "primary" : "success"}
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={() => setPaymentDialog({ open: true, invoice })}
                        disabled={amountDue <= 0}
                      >
                        {amountDue > 0 ? 'Pay Now' : 'Paid'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Invoice History with Tabs */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Invoice History</Typography>
        
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label={`Unpaid (${outstandingInvoices.length})`} />
          <Tab label={`Paid (${billingHistory.filter(inv => inv.status === 'PAID').length})`} />
        </Tabs>

        {/* Unpaid Invoices Tab */}
        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outstandingInvoices.map((invoice) => {
                  const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
                  const amountDue = invoice.amount - totalPaid;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>#{invoice.id}</TableCell>
                      <TableCell>
                        {(() => {
                          const formatted = formatCurrency(invoice.amount, tenantSettings, invoice.convertedAmount);
                          return (
                            <Box>
                              <div>{formatted.display}</div>
                              {formatted.rateInfo && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {formatted.rateInfo}
                                </Typography>
                              )}
                            </Box>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={invoice.status} 
                          size="small"
                          color={invoice.status === 'OVERDUE' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{invoice.description || 'Monthly subscription'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => setPaymentDialog({ open: true, invoice })}
                          disabled={amountDue <= 0}
                        >
                          Pay {(() => {
                            const convertedAmountDue = (invoice.convertedAmount?.convertedAmount || invoice.amount) - 
                              (invoice.payments || []).reduce((sum, payment) => 
                                sum + (payment.convertedAmount?.convertedAmount || payment.amount), 0);
                            const formatted = formatCurrency(convertedAmountDue, tenantSettings, invoice.convertedAmount);
                            return formatted.display;
                          })()}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {outstandingInvoices.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No unpaid invoices
                </Typography>
              </Box>
            )}
          </TableContainer>
        )}

        {/* Paid Invoices Tab */}
        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Paid Date</TableCell>
                  <TableCell>Paid By</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billingHistory.filter(inv => inv.status === 'PAID').map((invoice) => {
                  const lastPayment = invoice.payments?.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>#{invoice.id}</TableCell>
                      <TableCell>
                        {(() => {
                          const formatted = formatCurrency(invoice.amount, tenantSettings, invoice.convertedAmount);
                          return (
                            <Box>
                              <div>{formatted.display}</div>
                              {invoice.pricingPlan && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Plan: {invoice.pricingPlan.name} - ${invoice.pricingPlan.price}
                                </Typography>
                              )}
                            </Box>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {lastPayment && lastPayment.paymentDate ? new Date(lastPayment.paymentDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user?.name || 'System'}
                      </TableCell>
                      <TableCell>{invoice.description || 'Monthly subscription'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {billingHistory.filter(inv => inv.status === 'PAID').length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No paid invoices
                </Typography>
              </Box>
            )}
          </TableContainer>
        )}
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onClose={() => setPaymentDialog({ open: false, invoice: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          {paymentDialog.invoice && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Invoice #{paymentDialog.invoice.id}</Typography>
              <Box>
                <Typography component="span">Amount Due: </Typography>
                {(() => {
                  const convertedAmountDue = (paymentDialog.invoice.convertedAmount?.convertedAmount || paymentDialog.invoice.amount) - 
                    (paymentDialog.invoice.payments || []).reduce((sum, payment) => 
                      sum + (payment.convertedAmount?.convertedAmount || payment.amount), 0);
                  const formatted = formatCurrency(convertedAmountDue, tenantSettings, paymentDialog.invoice.convertedAmount);
                  return (
                    <Box component="span">
                      {formatted.display}
                      {formatted.rateInfo && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatted.rateInfo}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}
              </Box>
              <Typography variant="body2" sx={{ mb: 3 }}>{paymentDialog.invoice.description}</Typography>
              
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              
              <Alert severity="info">
                This is a demo. In production, this would integrate with Stripe or another payment processor.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog({ open: false, invoice: null })}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={async () => {
              try {
                await authenticatedFetch('/api/billing/make-payment', {
                  method: 'POST',
                  body: JSON.stringify({
                    invoiceId: paymentDialog.invoice.id,
                    amount: parseFloat(paymentAmount),
                    method: 'CARD'
                  })
                });
                setPaymentDialog({ open: false, invoice: null });
                setPaymentAmount('');
                // Refresh data
                const historyData = await authenticatedFetch('/api/billing/history');
                setBillingHistory(historyData);
                const outstanding = historyData.filter(invoice => 
                  invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
                );
                setOutstandingInvoices(outstanding);
              } catch (err) {
                setError(err.message);
              }
            }}
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Billing;
