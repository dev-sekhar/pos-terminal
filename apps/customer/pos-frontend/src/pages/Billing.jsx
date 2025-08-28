import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Payment, Receipt } from '@mui/icons-material';
import { authenticatedFetch } from '../utils/api';

const Billing = () => {
  const [billingData, setBillingData] = useState({ invoices: [], totalDue: 0 });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CARD',
    reference: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const data = await authenticatedFetch('/api/billing');
      setBillingData(data);
    } catch (error) {
      setError('Failed to fetch billing data');
    }
  };

  const handlePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await authenticatedFetch('/api/billing/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          reference: paymentForm.reference
        })
      });

      setPaymentDialog(false);
      setPaymentForm({ amount: '', method: 'CARD', reference: '' });
      fetchBillingData();
      setError('');
    } catch (error) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Billing & Payments</Typography>
        <Button
          variant="contained"
          startIcon={<Payment />}
          onClick={() => setPaymentDialog(true)}
        >
          Make Payment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Outstanding Balance
              </Typography>
              <Typography variant="h4" color={billingData.totalDue > 0 ? 'error' : 'success'}>
                ${billingData.totalDue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4">
                {billingData.invoices.length}
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
              {billingData.invoices.map((invoice) => {
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
                    <TableCell>{invoice.description}</TableCell>
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

        {billingData.invoices.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No invoices found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              >
                <MenuItem value="CARD">Credit Card</MenuItem>
                <MenuItem value="BANK">Bank Transfer</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reference (Optional)"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              placeholder="Transaction reference or notes"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePayment} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Make Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Billing;