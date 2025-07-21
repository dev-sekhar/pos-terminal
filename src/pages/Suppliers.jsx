import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Grid, Chip, Switch, FormControlLabel, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect } from 'react';
import supplierSchema from '../schemas/supplierSchema';

const initialSuppliers = [
  { id: 1, name: 'ABC Traders', contact: '1234567890', email: 'abc@traders.com', address: 'Main Street', userName: '', active: true, deleted: false },
  { id: 2, name: 'XYZ Mart', contact: '9876543210', email: 'xyz@mart.com', address: 'Market Road', userName: '', active: true, deleted: false },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('suppliersData');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', address: '', userName: '', active: true });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    localStorage.setItem('suppliersData', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleOpen = () => {
    setForm({ name: '', contact: '', email: '', address: '', userName: '', active: true });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddOrEdit = async () => {
    try {
      await supplierSchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      if (editId) {
        setSuppliers(suppliers.map(s => s.id === editId ? { ...s, ...form } : s));
      } else {
        setSuppliers([
          ...suppliers,
          { ...form, id: Date.now(), deleted: false }
        ]);
      }
      setOpen(false);
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
  };

  const handleEdit = (supplier) => {
    setForm({ ...supplier });
    setEditId(supplier.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, deleted: true } : s));
  };

  const filteredSuppliers = suppliers.filter(s => !s.deleted);

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Suppliers</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>Add Supplier</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.contact}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.address}</TableCell>
                  <TableCell>
                    {s.active ? <Chip label="Active" color="success" /> : <Chip label="Inactive" color="default" />}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(s)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(s.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
            </Alert>
          )}
          <TextField margin="dense" label="Supplier Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Contact" name="contact" value={form.contact} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="User Name" name="userName" value={form.userName} onChange={handleChange} fullWidth />
          <FormControlLabel
            control={<Switch checked={form.active} onChange={handleChange} name="active" color="primary" />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers; 