import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputLabel, FormControl, Select, MenuItem, IconButton, Grid, Collapse, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React, { useState, useEffect, useRef } from 'react';
import { useBranch } from '../context/BranchContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PrintIcon from '@mui/icons-material/Print';
import salesSchema from '../schemas/salesSchema';
import saleItemSchema from '../schemas/saleItemSchema';

const initialSales = [
  { id: 1, date: '2025-07-18', invoice: 'S001', items: [
    { productId: 1, name: 'Rice 1kg', qty: 2, price: 50 },
    { productId: 2, name: 'Oil 1L', qty: 1, price: 120 }
  ], branch: 'Main', deleted: false },
  { id: 2, date: '2025-07-17', invoice: 'S002', items: [
    { productId: 3, name: 'Sugar 1kg', qty: 5, price: 60 }
  ], branch: 'Branch A', deleted: false },
];

const getProducts = (branch) => {
  const saved = localStorage.getItem('productsData');
  const all = saved ? JSON.parse(saved) : [];
  return all.filter(p => p.branch === branch && !p.deleted);
};

const BillPrint = React.forwardRef(({ sale, calcSubtotal, calcTotal, currency }, ref) => (
  <div ref={ref} style={{ fontFamily: 'monospace', width: 350, margin: '0 auto', padding: 16 }}>
    <h2 style={{ textAlign: 'center', margin: 0 }}>POS Terminal</h2>
    <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 8 }}>Thank you for your purchase!</div>
    <div style={{ fontSize: 13, marginBottom: 8 }}>
      <div><strong>Invoice:</strong> {sale.invoice}</div>
      <div><strong>Date/Time:</strong> {sale.datetime}</div>
      <div><strong>Payment Type:</strong> {sale.paymentType}</div>
    </div>
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 8 }}>
      <thead>
        <tr>
          <th align="left">Item</th>
          <th align="right">Qty</th>
          <th align="right">Price</th>
          <th align="right">Total</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(sale.items) && sale.items.map((item, idx) => (
          <tr key={idx}>
            <td>{item.name}</td>
            <td align="right">{item.qty}</td>
            <td align="right">{currency} {item.price}</td>
            <td align="right">{currency} {((item.qty * item.price) * (1 - (item.discount || 0) / 100) * (1 + (item.tax || 0) / 100)).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ borderTop: '1px dashed #888', margin: '8px 0' }}></div>
    <div style={{ fontSize: 13 }}>
      <div><strong>Subtotal:</strong> {currency} {calcSubtotal(sale.items)}</div>
      <div><strong>Basket Discount:</strong> {sale.discount || 0}%</div>
      <div><strong>Total:</strong> {currency} {calcTotal(sale.items, sale.discount)}</div>
    </div>
    <div style={{ textAlign: 'center', fontSize: 11, marginTop: 12 }}>
      Powered by POS Terminal
    </div>
  </div>
));

const Sales = () => {
  const { branch, branches } = useBranch();
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('salesData');
    return saved ? JSON.parse(saved) : initialSales;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ datetime: '', invoice: '', salesperson: '', items: [], branch, discount: 0, paymentType: '' });
  const [products, setProducts] = useState(getProducts(branch));
  const [expanded, setExpanded] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [paymentTypes, setPaymentTypes] = useState(() => {
    const saved = localStorage.getItem('paymentTypesList');
    return saved ? JSON.parse(saved) : ['Cash', 'Card', 'UPI'];
  });
  const [formErrors, setFormErrors] = useState([]);
  useEffect(() => {
    const savedCurrency = localStorage.getItem('defaultCurrency');
    setCurrency(savedCurrency || 'USD');
  }, []);

  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    setProducts(getProducts(branch));
  }, [branch]);

  const handleOpen = () => {
    const now = new Date();
    const datetimeStr = now.toISOString().slice(0, 16).replace('T', ' ');
    // Generate invoice number: S + yyyymmdd + - + next number for the day
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const todaySales = sales.filter(s => s.datetime && s.datetime.startsWith(now.toISOString().slice(0, 10)));
    let nextNum = 1;
    while (todaySales.some(s => s.invoice === `S${datePart}-${String(nextNum).padStart(3, '0')}`)) {
      nextNum++;
    }
    const invoice = `S${datePart}-${String(nextNum).padStart(3, '0')}`;
    setForm({ datetime: datetimeStr, invoice, salesperson: '', items: [], branch, discount: 0, paymentType: paymentTypes[0] || '' });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = async () => {
    try {
      await salesSchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      const now = new Date();
      const datetimeStr = now.toISOString().slice(0, 16).replace('T', ' ');
      // Generate invoice number as above
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const todaySales = sales.filter(s => s.datetime && s.datetime.startsWith(now.toISOString().slice(0, 10)));
      let nextNum = 1;
      while (todaySales.some(s => s.invoice === `S${datePart}-${String(nextNum).padStart(3, '0')}`)) {
        nextNum++;
      }
      const invoice = `S${datePart}-${String(nextNum).padStart(3, '0')}`;
      let newForm = { ...form, datetime: datetimeStr, invoice };
      if (!newForm.paymentType) newForm.paymentType = paymentTypes[0] || '';
      if (editId) {
        setSales(sales.map(s => s.id === editId ? { ...s, ...newForm } : s));
      } else {
        setSales([
          ...sales,
          { ...newForm, id: Date.now() }
        ]);
      }
      setOpen(false);
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
  };

  const handleEdit = (sale) => {
    setForm({ ...sale });
    setEditId(sale.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setSales(sales.map(s => s.id === id ? { ...s, deleted: true } : s));
  };

  // Item management for dialog
  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      if (field === 'productId') {
        const prod = products.find(p => p.id === Number(value));
        items[idx] = { ...items[idx], productId: prod.id, name: prod.name, price: prod.price, qty: 1, discount: 0, tax: 0 };
      } else if (field === 'qty') {
        items[idx] = { ...items[idx], qty: Number(value) };
      } else if (field === 'discount') {
        items[idx] = { ...items[idx], discount: Number(value) };
      } else if (field === 'tax') {
        items[idx] = { ...items[idx], tax: Number(value) };
      }
      return { ...f, items };
    });
  };
  const handleAddItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { productId: '', name: '', qty: 1, price: 0, discount: 0, tax: 0 }] }));
  };
  const handleRemoveItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const handleExpandClick = (id) => {
    setExpanded(exp => ({ ...exp, [id]: !exp[id] }));
  };

  // Calculate totals
  const calcItemTotal = (item) => {
    if (!item) return 0;
    const base = (item.qty || 0) * (item.price || 0);
    const discount = base * (Number(item.discount) / 100);
    const taxed = (base - discount) * (1 + Number(item.tax) / 100);
    return Math.round(taxed * 100) / 100;
  };
  const calcSubtotal = (items) => Array.isArray(items) ? items.reduce((sum, item) => sum + calcItemTotal(item), 0) : 0;
  const calcTotal = (items, basketDiscount = 0) => {
    const subtotal = calcSubtotal(items);
    const discountAmt = subtotal * (Number(basketDiscount) / 100);
    return Math.round((subtotal - discountAmt) * 100) / 100;
  };

  // Filter and sort sales by search and branch
  let filteredSales = sales.filter(s => s.branch === branch && !s.deleted);
  if (searchInvoice) {
    filteredSales = filteredSales.filter(s => s.invoice.toLowerCase().includes(searchInvoice.toLowerCase()));
  }
  if (searchDate) {
    filteredSales = filteredSales.filter(s => s.date === searchDate);
  }
  filteredSales = filteredSales.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Print bill handler
  const printWindowRef = useRef(null);
  const [printSale, setPrintSale] = useState(null);
  const handlePrint = () => {
    setPrintSale(form);
    setTimeout(() => {
      if (printWindowRef.current) {
        const printContents = printWindowRef.current.innerHTML;
        const printWindow = window.open('', '', 'width=600,height=800');
        printWindow.document.write('<html><head><title>Print Bill</title>');
        printWindow.document.write('<style>body{margin:0;padding:0;}@media print{body{margin:0;}}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
      }
    }, 100);
  };

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Sales</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label="Search Invoice #"
              value={searchInvoice}
              onChange={e => setSearchInvoice(e.target.value)}
              size="small"
            />
            <TextField
              label="Search Date"
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>New Sale</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Date/Time</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total (₹)</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map(s => (
                <React.Fragment key={s.id}>
                  <TableRow>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleExpandClick(s.id)}>
                        {expanded[s.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{s.datetime}</TableCell>
                    <TableCell>{s.invoice}</TableCell>
                    <TableCell>{s.items.length}</TableCell>
                    <TableCell>{currency} {calcTotal(s.items, s.discount)}</TableCell>
                    <TableCell>{s.paymentType}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(s)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(s.id)} size="small" color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expanded[s.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>Items</Typography>
                          {s.salesperson && (
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Salesperson:</strong> {s.salesperson}</Typography>
                          )}
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
                              {Array.isArray(s.items) && s.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.qty}</TableCell>
                                  <TableCell>{currency} {item.price}</TableCell>
                                  <TableCell>
                                    {currency} {item.qty * item.price}
                                    {item.discount ? ` - ${item.discount}%` : ''}
                                    {item.tax ? ` + ${item.tax}%` : ''}
                                    <br />
                                    <strong>Final: {currency} {calcItemTotal(item)}</strong>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="body2">Subtotal: {currency} {calcSubtotal(s.items)}</Typography>
                            <Typography variant="body2">Basket Discount: {s.discount || 0}%</Typography>
                            <Typography variant="subtitle2">Total: {currency} {calcTotal(s.items, s.discount)}</Typography>
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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        {/* Make the dialog wider for better item row layout */}
        <style>{`.MuiDialog-paperWidthSm { max-width: 900px !important; }`}</style>
        <DialogTitle>{editId ? 'Edit Sale' : 'New Sale'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
            </Alert>
          )}
          <TextField margin="dense" label="Salesperson" name="salesperson" value={form.salesperson} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          {/* Print Bill Preview (hidden, for print) */}
          {printSale && (
            <div style={{ display: 'none' }}>
              <div ref={printWindowRef}>
                <BillPrint sale={printSale} calcSubtotal={calcSubtotal} calcTotal={calcTotal} currency={currency} />
              </div>
            </div>
          )}
          <TextField margin="dense" label="Date/Time" name="datetime" value={form.datetime} fullWidth InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Type</InputLabel>
            <Select name="paymentType" value={form.paymentType} label="Payment Type" onChange={handleChange}>
              {paymentTypes.map(type => (
                <MenuItem value={type} key={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="dense" label="Invoice #" name="invoice" value={form.invoice} fullWidth InputProps={{ readOnly: true }} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select name="branch" value={form.branch} label="Branch" onChange={handleChange}>
              {branches.map(b => (
                <MenuItem value={b} key={b}>{b}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField margin="dense" label="Basket Discount (%)" name="discount" value={form.discount} onChange={handleChange} type="number" fullWidth />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Items</Typography>
            {Array.isArray(form.items) && form.items.map((item, idx) => (
              <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.qty}
                    onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="Discount (%)"
                    type="number"
                    value={item.discount}
                    onChange={e => handleItemChange(idx, 'discount', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="Tax (%)"
                    type="number"
                    value={item.tax}
                    onChange={e => handleItemChange(idx, 'tax', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="Price"
                    value={(() => {
                      if (item.productId) {
                        const prod = products.find(p => p.id === item.productId);
                        return prod ? currency + ' ' + prod.price : '';
                      }
                      return '';
                    })()}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }} sx={{ textAlign: 'center' }}>
                  <IconButton onClick={() => handleRemoveItem(idx)} size="small" color="error"><RemoveIcon /></IconButton>
                </Grid>
              </Grid>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 1 }}>Add Item</Button>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="body2">Subtotal: {currency} {calcSubtotal(form.items)}</Typography>
              <Typography variant="body2">Basket Discount: {form.discount || 0}%</Typography>
              <Typography variant="subtitle2">Total: {currency} {calcTotal(form.items, form.discount)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
          <Button onClick={handlePrint} variant="outlined" startIcon={<PrintIcon />}>Print Bill</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;
