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
  CardContent
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Layout from '../components/Layout';

const Billing = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBillingData();
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
        <Box display="flex" alignItems="center" mb={3}>
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
                  {billingData?.tenant?.pricingPlan?.price || 'Free'}
                </Typography>
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
      </Box>
    </Layout>
  );
};

export default Billing;