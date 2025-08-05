import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { authenticatedFetch } from "../../utils/api";

const initialFormState = {
  poNumber: "",
  datetime: "",
  supplierId: "",
  branchId: "",
  items: [],
  // We add total and discount for consistency, even if not fully used yet
  total: 0,
  discount: 0,
};

const NewPurchaseDialog = ({
  open,
  onClose,
  onSave,
  branch,
  branches,
  products,
  suppliers,
  settings, // Pass settings for currency
}) => {
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    const initializeForm = async () => {
      if (open) {
        try {
          const { poNumber } = await authenticatedFetch(
            "/api/purchases/utils/new-ponumber"
          );
          const datetime = new Date().toISOString().slice(0, 16);
          setForm({
            ...initialFormState,
            poNumber,
            datetime,
            branchId: branch?.id || "",
          });
          setFormErrors([]);
        } catch (err) {
          setFormErrors(["Failed to generate a new PO Number."]);
        }
      }
    };
    initializeForm();
  }, [open, branch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (idx, field, value) => {
    const newItems = [...form.items];
    const item = { ...newItems[idx] };

    item[field] = value;
    if (field === "productId") {
      item.quantity = 1;
      // Set the price from the product list
      const product = products.find((p) => p.id === value);
      item.price = product ? product.price : 0;
    }

    newItems[idx] = item;
    setForm((f) => ({ ...f, items: newItems }));
  };

  const handleAddItem = () => {
    const lastItem = form.items[form.items.length - 1];
    if (lastItem && !lastItem.productId) return;
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantity: 1, price: 0 }],
    }));
  };
  const handleRemoveItem = (idx) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSaveClick = async () => {
    if (form.items.length === 0) {
      setFormErrors(["Cannot create a purchase with no items."]);
      return;
    }
    const payload = {
      ...form,
      items: form.items.map(({ productId, quantity }) => ({
        productId,
        quantity: Number(quantity),
      })),
    };
    try {
      await onSave(payload);
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const calculateTotal = () => {
    return form.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
  };

  const currency = settings?.currency || "$";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>New Purchase Order</DialogTitle>
      <DialogContent>
        {formErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formErrors.join(", ")}
          </Alert>
        )}
        {/* --- ADOPTED Grid LAYOUT FROM SALES --- */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="dense"
              label="PO #"
              value={form.poNumber}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm="auto" sx={{ minWidth: 200, flexGrow: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Branch</InputLabel>
              <Select
                name="branchId"
                value={form.branchId}
                label="Branch"
                onChange={handleChange}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm="auto" sx={{ minWidth: 200, flexGrow: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Supplier</InputLabel>
              <Select
                name="supplierId"
                value={form.supplierId}
                label="Supplier"
                onChange={handleChange}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" mb={1}>
            Items
          </Typography>
          {/* --- ADOPTED flexBasis LAYOUT FOR ITEMS --- */}
          {form.items.map((item, idx) => (
            <Grid
              container
              spacing={1}
              alignItems="center"
              key={idx}
              sx={{ mb: 1, flexWrap: "nowrap" }}
            >
              <Grid item sx={{ minWidth: 200, flexBasis: "40%" }}>
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={item.productId || ""}
                    label="Product"
                    onChange={(e) =>
                      handleItemChange(idx, "productId", e.target.value)
                    }
                    disabled={!form.branchId || !form.supplierId}
                  >
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sx={{ flexBasis: "15%" }}>
                <TextField
                  label="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(idx, "quantity", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item sx={{ flexBasis: "20%" }}>
                <TextField
                  label="Price"
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(idx, "price", e.target.value)
                  }
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ mr: 1 }}>{currency}</Typography>
                    ),
                  }}
                />
              </Grid>
              <Grid item sx={{ flexBasis: "20%", textAlign: "center" }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {currency} {(item.quantity * item.price).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item sx={{ flexBasis: "5%", textAlign: "right" }}>
                <IconButton onClick={() => handleRemoveItem(idx)} color="error">
                  <RemoveIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ mt: 1 }}
            disabled={!form.branchId || !form.supplierId}
          >
            Add Item
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sx={{ textAlign: "right" }}>
            <Typography variant="h6">
              Total: {currency} {calculateTotal().toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveClick} variant="contained">
          Create Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewPurchaseDialog;
