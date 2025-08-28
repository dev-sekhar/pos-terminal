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
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const Tenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5002/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      } else {
        setError('Failed to fetch tenants');
      }
    } catch (err) {
      setError('Error loading tenants');
    } finally {
      setLoading(false);
    }
  };

  const toggleTenantStatus = async (tenantId) => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(`http://localhost:5002/api/tenants/${tenantId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchTenants(); // Refresh the list
      } else {
        setError('Failed to update tenant status');
      }
    } catch (err) {
      setError('Error updating tenant status');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Layout>
      <Box>
      <Typography variant="h4" gutterBottom>
        Tenants
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage all tenant organizations in the system
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Users</TableCell>
              <TableCell align="center">Branches</TableCell>
              <TableCell align="center">Products</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">
                    {tenant.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.subdomain} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.pricingPlan?.name || 'No Plan'} 
                    size="small"
                    color={tenant.pricingPlan ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={tenant.active}
                        onChange={() => toggleTenantStatus(tenant.id)}
                        size="small"
                      />
                    }
                    label={tenant.active ? 'Active' : 'Inactive'}
                    labelPlacement="end"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {tenant._count.users} / {tenant.pricingPlan?.maxUsers || '∞'}
                  </Typography>
                  {tenant.pricingPlan && tenant._count.users >= parseInt(tenant.pricingPlan.maxUsers) && (
                    <Chip label="Limit Reached" size="small" color="warning" sx={{ mt: 0.5 }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {tenant._count.branches} / {tenant.pricingPlan?.maxBranches || '∞'}
                  </Typography>
                  {tenant.pricingPlan && tenant._count.branches >= parseInt(tenant.pricingPlan.maxBranches) && (
                    <Chip label="Limit Reached" size="small" color="warning" sx={{ mt: 0.5 }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {tenant._count.products} / {tenant.pricingPlan?.maxProducts || '∞'}
                  </Typography>
                  {tenant.pricingPlan && tenant._count.products >= parseInt(tenant.pricingPlan.maxProducts) && (
                    <Chip label="Limit Reached" size="small" color="warning" sx={{ mt: 0.5 }} />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/billing/${tenant.id}`)}
                    title="View Billing"
                  >
                    <Receipt />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {tenants.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No tenants found
          </Typography>
        </Box>
      )}
      </Box>
    </Layout>
  );
};

export default Tenants;