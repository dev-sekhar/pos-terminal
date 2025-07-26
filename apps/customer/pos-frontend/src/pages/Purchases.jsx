import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputLabel, FormControl, Select, MenuItem, IconButton, Grid, Collapse, Alert, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PrintIcon from '@mui/icons-material/Print';
import { useTenant } from '../context/TenantContext';
import { useSettings } from '../context/SettingsContext';

const initialFormState = { poNumber: '', datetime: '', supplierId: '', branchId: '', items: [] };

const POPrint = React.forwardRef(({ purchase, settings }, ref) => {
    if (!purchase || !settings) return null;
    return (
      <div ref={ref} style={{ fontFamily: 'sans-serif', width: '80mm', padding: '2mm' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Purchase Order</h3>
        <p style={{ fontSize: '10px', textAlign: 'center' }}>{purchase.tenant?.name || 'Your Company'}</p>
        <hr />
        <p style={{ fontSize: '12px' }}><strong>PO #:</strong> {purchase.poNumber}</p>
        <p style={{ fontSize: '12px' }}><strong>Date:</strong> {new Date(purchase.datetime).toLocaleDateString()}</p>
        <p style={{ fontSize: '12px' }}><strong>Supplier:</strong> {purchase.supplier?.name || 'N/A'}</p>
        <p style={{ fontSize: '12px' }}><strong>Branch:</strong> {purchase.branch?.name || 'N/A'}</p>
        <hr />
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">Item</th><th align="right">Qty</th></tr></thead>
          <tbody>
            {purchase.items.map(item => (
              <tr key={item.id}><td>{item.product.name}</td><td align="right">{item.quantity}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
});

const Purchases = () => {
  const { tenant } = useTenant();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();

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
  const [printPO, setPrintPO] = useState(null);
  const printWindowRef = useRef(null);

  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token found");
    const response = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errData.message);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenant) return;
      setLoading(true);
      setError('');
      try {
        const [purchasesData, suppliersData, productsData, branchesData] = await Promise.all([
          callApi('/api/purchases'), callApi('/api/suppliers'), callApi('/api/products'), callApi('/api/branches'),
        ]);
        setPurchases(purchasesData || []);
        setSuppliers(suppliersData || []);
        setProducts(productsData || []);
        setBranches(branchesData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenant, callApi]);

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
      const purchasesData = await callApi('/api/purchases');
      setPurchases(purchasesData || []);
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await callApi(`/api/purchases/${id}`, { method: 'DELETE' });
      const purchasesData = await callApi('/api/purchases');
      setPurchases(purchasesData || []);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleExpandClick = id => setExpanded(exp => ({ ...exp, [id]: !exp[id] }));

  const handlePrint = (purchaseToPrint) => {
    setPrintPO(purchaseToPrint);
    setTimeout(() => {
      if (printWindowRef.current) {
        const printContents = printWindowRef.current.innerHTML;
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(printContents);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); setPrintPO(null); }, 300);
      }
    }, 100);
  };

  if (loading || settingsLoading) return <CircularProgress />;
  if (error || settingsError) return <Alert severity="error">{error || settingsError}</Alert>;
  if (!settings) return <Alert severity="warning">Could not load tenant settings.</Alert>;

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
                <TableCell>{settings.currency} {p.total.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePrint(p)} size="small" title="Print PO"><PrintIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(p.id)} color="error" size="small"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
              <TableRow><TableCell style={{ padding: 0 }} colSpan={6}><Collapse in={expanded[p.id]} timeout="auto" unmountOnExit>
                <Box m={2}>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Quantity</TableCell><TableCell>Price</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                    <TableBody>{p.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{settings.currency} {(item.price || 0).toFixed(2)}</TableCell>
                        <TableCell>{settings.currency} {(item.quantity * (item.price || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </Box>
              </Collapse></TableCell></TableRow>
            </React.Fragment>))}
          </TableBody>
        </Table>
      </Paper>
      
      <div style={{ display: 'none' }}>
        <POPrint ref={printWindowRef} purchase={printPO} settings={settings} />
      </div>

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