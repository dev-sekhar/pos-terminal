import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import inventorySchema from '../schemas/inventorySchema';
import { Alert } from '@mui/material';

const initialInventory = [
  { id: 1, product: 'Rice 1kg', branch: 'Main', stock: 30, reorderLevel: 20 },
  { id: 2, product: 'Oil 1L', branch: 'Main', stock: 8, reorderLevel: 10 },
  { id: 3, product: 'Sugar 1kg', branch: 'Branch A', stock: 4, reorderLevel: 10 },
  { id: 4, product: 'Salt 500g', branch: 'Branch A', stock: 22, reorderLevel: 15 },
];

function getActiveProducts() {
  const saved = localStorage.getItem('productsData');
  const all = saved ? JSON.parse(saved) : [];
  return all.filter(p => !p.deleted);
}

function getActiveBranches() {
  const saved = localStorage.getItem('branchesData');
  const all = saved ? JSON.parse(saved) : [];
  return all.filter(b => b.active && !b.deleted);
}

const Inventory = () => {
  const { branch } = useBranch();
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventoryData');
    return saved ? JSON.parse(saved) : initialInventory;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ branch: branch || '', product: '', stock: '', reorderLevel: '', userName: '' });
  const [products, setProducts] = useState(getActiveProducts());
  const [branches, setBranches] = useState(getActiveBranches());
  const [currency, setCurrency] = useState('USD');
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('defaultCurrency');
    setCurrency(savedCurrency || 'USD');
  }, []);

  useEffect(() => {
    setProducts(getActiveProducts());
  }, [open]);

  // Update branches list when dialog opens
  useEffect(() => {
    if (open) setBranches(getActiveBranches());
  }, [open]);

  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(inventory));
  }, [inventory]);

  const handleOpen = () => {
    setForm({ branch, product: '', stock: '', reorderLevel: '', userName: '' });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = async () => {
    try {
      await inventorySchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      if (editId) {
        setInventory(inventory.map(item => item.id === editId ? { ...item, ...form, stock: Number(form.stock), reorderLevel: Number(form.reorderLevel) } : item));
      } else {
        setInventory([
          ...inventory,
          { ...form, id: Date.now(), stock: Number(form.stock), reorderLevel: Number(form.reorderLevel) }
        ]);
      }
      setOpen(false);
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
  };

  const handleEdit = (item) => {
    setForm({ ...item });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, deleted: true } : item));
  };

  // Filter inventory by current branch and not deleted
  const filteredData = inventory.filter(item => item.branch === branch && !item.deleted);

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Inventory</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>Add Inventory</Button>
        </Grid>
      </Grid>

      {/* Low Stock Alerts */}
      <Grid container spacing={2} mb={2}>
        {filteredData
          .filter(item => item.stock < item.reorderLevel)
          .map(item => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#fff4f4' }}>
                <Typography variant="subtitle1">
                  🔴 Low Stock Alert
                </Typography>
                <Typography>
                  <strong>{item.product}</strong> has only {item.stock} units left (min {item.reorderLevel})
                </Typography>
              </Paper>
            </Grid>
          ))}
      </Grid>

      {/* Inventory Table */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Reorder Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>
                    {item.stock < item.reorderLevel ? (
                      <Chip label="Low" color="error" />
                    ) : (
                      <Chip label="OK" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(item)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Inventory' : 'Add Inventory'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select name="branch" value={form.branch} label="Branch" onChange={handleChange}>
              {branches.map(b => (
                <MenuItem value={b.tag} key={b.id}>{b.tag}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Product</InputLabel>
            <Select name="product" value={form.product} label="Product" onChange={handleChange}>
              {products.map(p => (
                <MenuItem value={p.name} key={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="dense" label="Stock" name="stock" value={form.stock} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField margin="dense" label="Reorder Level" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} type="number" fullWidth />
          <TextField margin="dense" label="User Name" name="userName" value={form.userName} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
  