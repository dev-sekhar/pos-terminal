import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputLabel, FormControl, Select, MenuItem, IconButton, Grid, Collapse, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React, { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import purchaseSchema from '../schemas/purchaseSchema';
import purchaseItemSchema from '../schemas/purchaseItemSchema';

const initialPurchases = [
  { id: 1, date: '2025-07-18', supplier: 'ABC Traders', items: [
    { productId: 1, name: 'Rice 1kg', qty: 2, price: 50 },
    { productId: 2, name: 'Oil 1L', qty: 1, price: 120 }
  ], branch: 'Main', deleted: false },
  { id: 2, date: '2025-07-17', supplier: 'XYZ Mart', items: [
    { productId: 3, name: 'Sugar 1kg', qty: 2, price: 60 }
  ], branch: 'Branch A', deleted: false },
];

const getProducts = (branch) => {
  const saved = localStorage.getItem('productsData');
  const all = saved ? JSON.parse(saved) : [];
  return all.filter(p => p.branch === branch && !p.deleted);
};

const Purchases = () => {
  const { branch, branches } = useBranch();
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('purchasesData');
    return saved ? JSON.parse(saved) : initialPurchases;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ datetime: '', poNumber: '', supplier: '', items: [], branch, userName: '' });
  const [deliveryDialog, setDeliveryDialog] = useState({ open: false, id: null, deliveryDate: '', paymentType: '', paymentRef: '', paymentAmount: '' });
  const [paymentTypes, setPaymentTypes] = useState(() => {
    const saved = localStorage.getItem('paymentTypesList');
    return saved ? JSON.parse(saved) : ['Cash', 'Card', 'UPI'];
  });
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('suppliersData');
    const all = saved ? JSON.parse(saved) : [];
    return all.filter(s => s.active && !s.deleted);
  });
  const [products, setProducts] = useState(getProducts(branch));
  const [expanded, setExpanded] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [formErrors, setFormErrors] = useState([]);
  useEffect(() => {
    const savedCurrency = localStorage.getItem('defaultCurrency');
    setCurrency(savedCurrency || 'USD');
  }, []);

  useEffect(() => {
    localStorage.setItem('purchasesData', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    setProducts(getProducts(branch));
  }, [branch]);

  useEffect(() => {
    const saved = localStorage.getItem('suppliersData');
    const all = saved ? JSON.parse(saved) : [];
    setSuppliers(all.filter(s => s.active && !s.deleted));
  }, []);

  const handleOpen = () => {
    const now = new Date();
    const datetimeStr = now.toISOString().slice(0, 16).replace('T', ' ');
    // Generate PO number: P + yyyymmdd + - + next number for the day
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const todayPurchases = purchases.filter(p => p.datetime && p.datetime.startsWith(now.toISOString().slice(0, 10)));
    let nextNum = 1;
    while (todayPurchases.some(p => p.poNumber === `P${datePart}-${String(nextNum).padStart(3, '0')}`)) {
      nextNum++;
    }
    const poNumber = `P${datePart}-${String(nextNum).padStart(3, '0')}`;
    setForm({ datetime: datetimeStr, poNumber, supplier: '', items: [], branch, userName: '' });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = async () => {
    try {
      await purchaseSchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      const now = new Date();
      const datetimeStr = now.toISOString().slice(0, 16).replace('T', ' ');
      // Generate PO number as above
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const todayPurchases = purchases.filter(p => p.datetime && p.datetime.startsWith(now.toISOString().slice(0, 10)));
      let nextNum = 1;
      while (todayPurchases.some(p => p.poNumber === `P${datePart}-${String(nextNum).padStart(3, '0')}`)) {
        nextNum++;
      }
      const poNumber = `P${datePart}-${String(nextNum).padStart(3, '0')}`;
      let newForm = { ...form, datetime: datetimeStr, poNumber };
      if (editId) {
        setPurchases(purchases.map(p => p.id === editId ? { ...p, ...newForm } : p));
      } else {
        setPurchases([
          ...purchases,
          { ...newForm, id: Date.now() }
        ]);
      }
      setOpen(false);
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
  };

  const handleEdit = (purchase) => {
    setForm({ ...purchase });
    setEditId(purchase.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setPurchases(purchases.map(p => p.id === id ? { ...p, deleted: true } : p));
  };

  const handleExpandClick = (id) => {
    setExpanded(exp => ({ ...exp, [id]: !exp[id] }));
  };

  // Item management for dialog
  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      if (field === 'productId') {
        const prod = products.find(p => p.id === Number(value));
        items[idx] = { ...items[idx], productId: prod.id, name: prod.name, qty: 1 };
      } else if (field === 'qty') {
        items[idx] = { ...items[idx], qty: Number(value) };
      }
      return { ...f, items };
    });
  };
  const handleAddItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { productId: '', name: '', qty: 1 }] }));
  };
  const handleRemoveItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  // Calculate total
  const calcSubtotal = (items) => items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const calcTotal = (items, discount = 0, tax = 0) => {
    const subtotal = calcSubtotal(items);
    const discountAmt = subtotal * (Number(discount) / 100);
    const taxed = (subtotal - discountAmt) * (1 + Number(tax) / 100);
    return Math.round(taxed * 100) / 100;
  };

  // Filter purchases by current branch and not deleted
  const filteredPurchases = purchases.filter(p => p.branch === branch && !p.deleted);

  const handleOpenDeliveryDialog = (purchase) => {
    setDeliveryDialog({
      open: true,
      id: purchase.id,
      deliveryDate: new Date().toISOString().slice(0, 10),
      paymentType: paymentTypes[0] || '',
      paymentRef: '',
      paymentAmount: ''
    });
  };
  const handleCloseDeliveryDialog = () => setDeliveryDialog({ open: false, id: null, deliveryDate: '', paymentType: '', paymentRef: '', paymentAmount: '' });
  const handleDeliveryChange = e => {
    setDeliveryDialog(d => ({ ...d, [e.target.name]: e.target.value }));
  };
  const handleMarkDelivered = () => {
    setPurchases(purchases.map(p =>
      p.id === deliveryDialog.id
        ? { ...p, delivered: true, deliveryDate: deliveryDialog.deliveryDate, paymentType: deliveryDialog.paymentType, paymentRef: deliveryDialog.paymentRef, paymentAmount: deliveryDialog.paymentAmount }
        : p
    ));
    handleCloseDeliveryDialog();
  };
  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Purchases</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>New Purchase</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Date/Time</TableCell>
                <TableCell>PO #</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPurchases.map(p => (
                <React.Fragment key={p.id}>
                  <TableRow>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleExpandClick(p.id)}>
                        {expanded[p.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{p.datetime}</TableCell>
                    <TableCell>{p.poNumber}</TableCell>
                    <TableCell>{p.supplier}</TableCell>
                    <TableCell>{p.items.length}</TableCell>
                    <TableCell>{currency} {calcTotal(p.items, p.discount, p.tax)}</TableCell>
                    <TableCell>
                      {p.delivered ? (
                        <Typography color="success.main">Delivered</Typography>
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => handleOpenDeliveryDialog(p)}>Mark Delivered</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(p)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(p.id)} size="small" color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expanded[p.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>Items</Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Line Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {p.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.qty}</TableCell>
                                  <TableCell>{currency} {item.price}</TableCell>
                                  <TableCell>{currency} {item.qty * item.price}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="body2">Subtotal: {currency} {calcSubtotal(p.items)}</Typography>
                            <Typography variant="body2">Discount: {p.discount || 0}%</Typography>
                            <Typography variant="body2">Tax: {p.tax || 0}%</Typography>
                            <Typography variant="subtitle2">Total: {currency} {calcTotal(p.items, p.discount, p.tax)}</Typography>
                            {p.delivered && (
                              <Box sx={{ mt: 2, textAlign: 'left' }}>
                                <Typography variant="body2" color="success.main">Delivered on: {p.deliveryDate}</Typography>
                                <Typography variant="body2">Payment Type: {p.paymentType}</Typography>
                                <Typography variant="body2">Payment Ref: {p.paymentRef}</Typography>
                                <Typography variant="body2">Payment Amount: {currency} {p.paymentAmount}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Purchase' : 'New Purchase'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
            </Alert>
          )}
          <TextField margin="dense" label="Date/Time" name="datetime" value={form.datetime} fullWidth InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} />
          <TextField margin="dense" label="PO #" name="poNumber" value={form.poNumber} fullWidth InputProps={{ readOnly: true }} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Supplier</InputLabel>
            <Select name="supplier" value={form.supplier} label="Supplier" onChange={handleChange}>
              {suppliers.map(s => (
                <MenuItem value={s.name} key={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="dense" label="User Name" name="userName" value={form.userName} onChange={handleChange} fullWidth />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select name="branch" value={form.branch} label="Branch" onChange={handleChange}>
              {branches.map(b => (
                <MenuItem value={b} key={b}>{b}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Items</Typography>
            {form.items.map((item, idx) => (
              <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={item.productId}
                      label="Product"
                      onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                    >
                      {products.map(p => (
                        <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.qty}
                    onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }} sx={{ textAlign: 'center' }}>
                  <IconButton onClick={() => handleRemoveItem(idx)} size="small" color="error"><RemoveIcon /></IconButton>
                </Grid>
              </Grid>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 1 }}>Add Item</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deliveryDialog.open} onClose={handleCloseDeliveryDialog} fullWidth maxWidth="xs">
        <DialogTitle>Mark as Delivered</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Delivery Date"
            name="deliveryDate"
            type="date"
            value={deliveryDialog.deliveryDate}
            onChange={handleDeliveryChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Type</InputLabel>
            <Select name="paymentType" value={deliveryDialog.paymentType} label="Payment Type" onChange={handleDeliveryChange}>
              {paymentTypes.map(type => (
                <MenuItem value={type} key={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Payment Reference"
            name="paymentRef"
            value={deliveryDialog.paymentRef}
            onChange={handleDeliveryChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Payment Amount"
            name="paymentAmount"
            type="number"
            value={deliveryDialog.paymentAmount}
            onChange={handleDeliveryChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeliveryDialog}>Cancel</Button>
          <Button onClick={handleMarkDelivered} variant="contained">Mark Delivered</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Purchases;
