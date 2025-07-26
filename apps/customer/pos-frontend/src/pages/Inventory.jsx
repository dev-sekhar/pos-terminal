import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, FormControl, InputLabel, Select, MenuItem, Chip, Alert, CircularProgress, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTenant } from '../context/TenantContext';

const initialFormState = { productId: '', branchId: '', stock: '', reorderLevel: '' };

const Inventory = () => {
  const { tenant } = useTenant();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(initialFormState);
  
  const [formErrors, setFormErrors] = useState([]);

  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errData.message);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [invData, prodData, branchData] = await Promise.all([
        callApi('/api/inventory'),
        callApi('/api/products'),
        callApi('/api/branches'),
      ]);
      setInventory(invData || []);
      setProducts(prodData || []);
      setBranches(branchData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    if (tenant) fetchData();
  }, [tenant, fetchData]);

  const handleOpen = (item = null) => {
    setIsEditing(!!item);
    setCurrentItem(item ? { ...item } : initialFormState);
    setFormErrors([]);
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);
  const handleChange = e => setCurrentItem(i => ({ ...i, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    // --- THIS IS THE FIX (Part 1: Frontend Validation) ---
    // Enforce the business rule on the frontend before making an API call.
    if (Number(currentItem.reorderLevel) > Number(currentItem.stock)) {
      setFormErrors(["Reorder level cannot be greater than the stock."]);
      return; // Stop the submission
    }
    
    setFormErrors([]);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/inventory/${currentItem.id}` : '/api/inventory';
    
    try {
      await callApi(url, { method, body: JSON.stringify(currentItem) });
      handleClose();
      fetchData();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory record?')) return;
    try {
      await callApi(`/api/inventory/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const lowStockAlerts = inventory.filter(item => item.stock < item.reorderLevel);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Inventory</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Stock</Button>
      </Box>

      {lowStockAlerts.length > 0 && (
        <Grid container spacing={2} mb={2}>
          {lowStockAlerts.map(item => (
            // --- THIS IS THE FIX (Part 2: MUI Grid Syntax) ---
            // Props like xs, md, lg are now passed directly to the Grid component.
            <Grid key={item.id} xs={12} md={6} lg={4}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#fff4f4' }}>
                <Typography variant="subtitle1">🔴 Low Stock Alert</Typography>
                <Typography>
                  <strong>{item.product.name}</strong> at <strong>{item.branch.name}</strong> has only {item.stock} units left.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper>
        <Table>
          <TableHead><TableRow>
            <TableCell>Product</TableCell><TableCell>Branch</TableCell><TableCell>Stock</TableCell><TableCell>Reorder Level</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {inventory.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.branch.name}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>
                  {item.stock < item.reorderLevel ? <Chip label="Low" color="error" /> : <Chip label="OK" color="success" />}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(item)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Inventory' : 'Add New Stock'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.join(', ')}</Alert>}
          <FormControl fullWidth margin="dense" disabled={isEditing}>
            <InputLabel>Product</InputLabel>
            <Select name="productId" value={currentItem.productId} label="Product" onChange={handleChange}>
              {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" disabled={isEditing}>
            <InputLabel>Branch</InputLabel>
            <Select name="branchId" value={currentItem.branchId} label="Branch" onChange={handleChange}>
              {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" label="Stock Quantity" name="stock" value={currentItem.stock} onChange={handleChange} type="number" fullWidth />
          <TextField margin="dense" label="Reorder Level" name="reorderLevel" value={currentItem.reorderLevel} onChange={handleChange} type="number" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? 'Save Changes' : 'Add Stock'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;