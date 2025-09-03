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
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import Layout from '../components/Layout';

const Payments = () => {
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [outstandingYear, setOutstandingYear] = useState(new Date().getFullYear());
  const [paidYear, setPaidYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [outstandingYear, paidYear]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      
      // Fetch outstanding invoices
      const outstandingResponse = await fetch(`http://localhost:5002/api/invoices/outstanding?year=${outstandingYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch paid payments
      const paidResponse = await fetch(`http://localhost:5002/api/payments/paid?year=${paidYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (outstandingResponse.ok && paidResponse.ok) {
        setOutstandingInvoices(await outstandingResponse.json());
        setPaidPayments(await paidResponse.json());
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoices = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/generate-invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Generated ${result.invoicesGenerated} invoices`);
        fetchData();
      } else {
        setError('Failed to generate invoices');
      }
    } catch (err) {
      setError('Error generating invoices');
    } finally {
      setGenerating(false);
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'CARD': return 'primary';
      case 'FREE': return 'success';
      case 'BANK': return 'info';
      default: return 'default';
    }
  };

  const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => {
    const totalPaid = invoice.payments?.reduce((pSum, payment) => pSum + payment.amount, 0) || 0;
    return sum + (invoice.amount - totalPaid);
  }, 0);
  
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Payments & Billing
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={generateInvoices}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Invoices'}
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
                  ${totalOutstanding.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Paid
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${totalPaid.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="primary">
                  ${(totalPaid + totalOutstanding).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Outstanding Invoices" />
            <Tab label="Paid Records" />
          </Tabs>
          
          {tabValue === 0 && (
            <Box>
              <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Outstanding Invoices</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select value={outstandingYear} onChange={(e) => setOutstandingYear(e.target.value)}>
                    {[2023, 2024, 2025, 2026].map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Outstanding</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {outstandingInvoices.map((invoice) => {
                      const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
                      const outstanding = invoice.amount - totalPaid;
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>#{invoice.id}</TableCell>
                          <TableCell>{invoice.tenant.name}</TableCell>
                          <TableCell>{invoice.pricingPlan.name}</TableCell>
                          <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip label={invoice.status} size="small" color={invoice.status === 'OVERDUE' ? 'error' : 'warning'} />
                          </TableCell>
                          <TableCell>${outstanding.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {outstandingInvoices.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">No outstanding invoices for {outstandingYear}</Typography>
                </Box>
              )}
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Paid Records</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select value={paidYear} onChange={(e) => setPaidYear(e.target.value)}>
                    {[2023, 2024, 2025, 2026].map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paidPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>#{payment.id}</TableCell>
                        <TableCell>{payment.invoice.tenant.name}</TableCell>
                        <TableCell>{payment.invoice.pricingPlan.name}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={payment.method} size="small" color={getMethodColor(payment.method)} />
                        </TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {paidPayments.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">No paid records for {paidYear}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default Payments;