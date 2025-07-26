import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputLabel, FormControl, Select, MenuItem, IconButton, Grid, Collapse, Alert, CircularProgress, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTenant } from '../context/TenantContext';

const initialFormState = { poNumber: '', datetime: '', supplierId: '', branchId: '', items: [] };

const Purchases = () => {
  const { tenant } = useTenant();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);
  const [expanded, setExpanded] = useState({});

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
      const [purchasesData, suppliersData, productsData, branchesData] = await Promise.all([
        callApi('/api/purchases'),
        callApi('/api/suppliers'),
        callApi('/api/products'),
        callApi('/api/branches'),
      ]);
      setPurchases(purchasesData);
      setSuppliers(suppliersData);
      setProducts(productsData);
      setBranches(branchesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    if (tenant) fetchData();
  }, [tenant, fetchData]);

  const handleOpen = async () => {
    try {
        const { poNumber } = await callApi('/api/purchases/utils/new-ponumber');
        const datetime = new Date().toISOString().slice(0, 16);
        setForm({ ...initialFormState, poNumber, datetime });
        setFormErrors([]);
        setOpen(true);
    } catch (err) {
        setError('Failed to generate a new PO Number.');
    }
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (idx, field, value) => {
    const newItems = [...form.items];
    const item = { ...newItems[idx] };
    
    if (field === 'productId') {
        item.productId = value;
        item.quantity = 1;
    } else {
        item[field] = value;
    }
    newItems[idx] = item;
    setForm(f => ({ ...f, items: newItems }));
  };

  const handleAddItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: 1 }] }));
  const handleRemoveItem = idx => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setFormErrors([]);
    const payload = { ...form, items: form.items.map(({productId, quantity}) => ({productId, quantity: Number(quantity)})) };

    try {
      await callApi('/api/purchases', { method: 'POST', body: JSON.stringify(payload) });
      handleClose();
      fetchData();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
    try {
      await callApi(`/api/purchases/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleExpandClick = id => setExpanded(exp => ({ ...exp, [id]: !exp[id] }));

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Purchases</Typography>
        <Button variant="contained" onClick={handleOpen}>New Purchase</Button>
      </Box>
      <Paper>
        <Table>
          <TableHead><TableRow>
            <TableCell />
            <TableCell>Date/Time</TableCell><TableCell>PO #</TableCell><TableCell>Supplier</TableCell><TableCell>Total</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {purchases.map(p => (<React.Fragment key={p.id}>
              <TableRow>
                <TableCell><IconButton size="small" onClick={() => handleExpandClick(p.id)}>{expanded[p.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton></TableCell>
                <TableCell>{new Date(p.datetime).toLocaleString()}</TableCell>
                <TableCell>{p.poNumber}</TableCell>
                <TableCell>{p.supplier?.name || 'N/A'}</TableCell>
                <TableCell>{p.total.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(p.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
              <TableRow><TableCell style={{ padding: 0 }} colSpan={6}><Collapse in={expanded[p.id]} timeout="auto" unmountOnExit>
                <Box m={2}>
                  <Typography variant="h6">Items</Typography>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Quantity</TableCell><TableCell>Price</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                    <TableBody>{p.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{(item.price || 0).toFixed(2)}</TableCell>
                        <TableCell>{(item.quantity * (item.price || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </Box>
              </Collapse></TableCell></TableRow>
            </React.Fragment>))}
          </TableBody>
        </Table>
      </Paper>
      
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>New Purchase Order</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.join(', ')}</Alert>}
          <TextField margin="dense" label="PO #" value={form.poNumber} fullWidth InputProps={{ readOnly: true }} />
          <TextField margin="dense" label="Date/Time" value={new Date(form.datetime).toLocaleString()} fullWidth InputProps={{ readOnly: true }} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Supplier</InputLabel>
            <Select name="supplierId" value={form.supplierId} label="Supplier" onChange={handleChange}>
              {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Branch</InputLabel>
            <Select name="branchId" value={form.branchId} label="Branch" onChange={handleChange}>
              {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="h6" mt={2}>Items</Typography>
          {form.items.map((item, idx) => (
            <Grid container spacing={1} alignItems="center" key={idx} my={1}>
              <Grid item xs={8}><FormControl fullWidth><InputLabel>Product</InputLabel>
                <Select value={item.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)}>
                  {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl></Grid>
              <Grid item xs={3}><TextField label="Qty" type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} fullWidth /></Grid>
              <Grid item xs={1}><IconButton onClick={() => handleRemoveItem(idx)} color="error"><RemoveIcon /></IconButton></Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 1 }}>Add Item</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Create Purchase</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Purchases;