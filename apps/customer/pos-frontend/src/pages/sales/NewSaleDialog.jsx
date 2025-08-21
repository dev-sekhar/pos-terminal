import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Box, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { authenticatedFetch } from '../../utils/api';
import { calcItemTotal, calcTotal } from '../../utils/salesUtils';

const initialFormState = { invoice: "", datetime: "", branchId: "", userId: "", paymentType: "", discount: 0, items: [] };

const NewSaleDialog = ({ open, onClose, onSave, user, branch, branches, inventory, settings }) => {
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    const initializeForm = async () => {
      if (open && user && branch) {
        try {
          const { invoice } = await authenticatedFetch("/api/sales/utils/new-invoice");
          // --- THIS IS THE FIX ---
          // Send the full ISO string (including the 'Z' for UTC) to the backend.
          const datetime = new Date().toISOString();
          
          setForm({
            ...initialFormState,
            invoice,
            datetime, // Pass the full, correct timestamp
            branchId: branch.id,
            paymentType: settings?.paymentTypes[0] || "cash",
            userId: user.id,
          });
          setFormErrors([]);
        } catch (err) {
          setFormErrors(["Failed to generate a new invoice number."]);
        }
      }
    };
    initializeForm();
  }, [open, user, branch, settings]);

  const availableProductsForSelectedBranch = useMemo(() => {
    if (!form.branchId) return [];
    return inventory.filter((inv) => Number(inv.branchId) === Number(form.branchId) && inv.stock > 0).map((inv) => inv.product);
  }, [form.branchId, inventory]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (idx, field, value) => {
    const newItems = [...form.items];
    const item = { ...newItems[idx] };
    if (field === "productId") {
      const existingItemIndex = newItems.findIndex((i) => i.productId === value);
      if (existingItemIndex > -1 && existingItemIndex !== idx) {
        newItems[existingItemIndex].quantity += 1;
        newItems.splice(idx, 1);
        setForm((f) => ({ ...f, items: newItems }));
        return;
      }
      const invItem = inventory.find((inv) => Number(inv.branchId) === Number(form.branchId) && inv.productId === value);
      item.productId = value;
      item.price = invItem ? invItem.product.price : 0;
      item.quantity = 1; item.discount = 0; item.tax = 0;
    } else if (field === "quantity") {
      const invItem = inventory.find((inv) => Number(inv.branchId) === Number(form.branchId) && inv.productId === item.productId);
      if (invItem && Number(value) > invItem.stock) {
        alert(`Quantity cannot exceed available stock of ${invItem.stock}`);
        item.quantity = invItem.stock;
      } else {
        item.quantity = Number(value);
      }
    } else {
      item[field] = value;
    }
    newItems[idx] = item;
    setForm((f) => ({ ...f, items: newItems }));
  };

  const handleAddItem = () => {
    const lastItem = form.items[form.items.length - 1];
    if (lastItem && !lastItem.productId) return;
    setForm((f) => ({ ...f, items: [...f.items, { productId: "", quantity: 1, discount: 0, tax: 0 }] }));
  };
  const handleRemoveItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSaveClick = async () => {
    try {
      await onSave(form);
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const currency = settings?.currency || '$';
  const paymentTypes = settings?.paymentTypes || ['Cash', 'Card'];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>New Sale</DialogTitle>
      <DialogContent>
        {formErrors.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.join(", ")}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField margin="dense" label="Invoice #" value={form.invoice} fullWidth InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} sm="auto" sx={{ minWidth: 200, flexGrow: 1 }}><FormControl fullWidth margin="dense"><InputLabel>Branch</InputLabel><Select name="branchId" value={form.branchId} label="Branch" onChange={handleChange}>{branches.map((b) => (<MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>))}</Select></FormControl></Grid>
          <Grid item xs={12} sm="auto" sx={{ minWidth: 200, flexGrow: 1 }}><TextField margin="dense" label="Salesperson" value={user?.name || ''} fullWidth InputProps={{ readOnly: true }} /></Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" mb={1}>Items</Typography>
          {form.branchId && availableProductsForSelectedBranch.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No products with available stock found in the selected branch. Please add stock via the Inventory page.
            </Alert>
          )}
          {form.items.map((item, idx) => (
            <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1, flexWrap: "nowrap" }}>
              <Grid item sx={{ minWidth: 200, flexBasis: "20%" }}><FormControl fullWidth><InputLabel>Product</InputLabel><Select value={item.productId || ''} label="Product" onChange={(e) => handleItemChange(idx, "productId", e.target.value)} disabled={!form.branchId}>{availableProductsForSelectedBranch.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item sx={{ flexBasis: "8%" }}><TextField label="Qty" type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", e.target.value)} fullWidth /></Grid>
              <Grid item sx={{ flexBasis: "8%" }}><TextField label="Discount (%)" type="number" value={item.discount} onChange={(e) => handleItemChange(idx, "discount", e.target.value)} fullWidth /></Grid>
              <Grid item sx={{ flexBasis: "8%" }}><TextField label="Tax (%)" type="number" value={item.tax} onChange={(e) => handleItemChange(idx, "tax", e.target.value)} fullWidth /></Grid>
              <Grid item sx={{ flexBasis: "12%" }}><Typography variant="body1" align="center" sx={{ fontWeight: "bold" }}>{currency} {calcItemTotal(item).toFixed(2)}</Typography></Grid>
              <Grid item sx={{ flexBasis: "6%", textAlign: "right" }}><IconButton onClick={() => handleRemoveItem(idx)} color="error"><RemoveIcon /></IconButton></Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 1 }} disabled={!form.branchId || availableProductsForSelectedBranch.length === 0}>
            Add Item
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4} sx={{ minWidth: 160 }}><FormControl fullWidth margin="dense"><InputLabel>Payment Type</InputLabel><Select name="paymentType" value={form.paymentType} label="Payment Type" onChange={handleChange}>{paymentTypes.map((type) => (<MenuItem value={type} key={type}>{type}</MenuItem>))}</Select></FormControl></Grid>
          <Grid item xs={12} sm={4}><TextField label="Basket Discount (%)" name="discount" value={form.discount} onChange={handleChange} type="number" fullWidth /></Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}><Typography variant="h6">Total: {currency} {calcTotal(form.items, form.discount).toFixed(2)}</Typography></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveClick} variant="contained">Create Sale</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewSaleDialog;