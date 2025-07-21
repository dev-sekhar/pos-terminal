import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Grid, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect } from 'react';
import productCategorySchema from '../schemas/productCategorySchema';
import { Alert } from '@mui/material';
import { useTenant } from '../context/TenantContext';

const initialCategories = [
  { id: 1, name: 'Grocery', description: 'Food and household items', active: true, userName: '', deleted: false },
  { id: 2, name: 'Electronics', description: 'Electronic devices and accessories', active: true, userName: '', deleted: false },
  { id: 3, name: 'Clothing', description: 'Apparel and fashion items', active: true, userName: '', deleted: false },
];

const ProductCategories = () => {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem(`${tenant}_productCategoriesData`);
    return saved ? JSON.parse(saved) : initialCategories;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', active: true, userName: '' });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    localStorage.setItem(`${tenant}_productCategoriesData`, JSON.stringify(categories));
  }, [categories, tenant]);

  const handleOpen = () => {
    setForm({ name: '', description: '', active: true, userName: '' });
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
      await productCategorySchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      if (editId) {
        setCategories(categories.map(c => c.id === editId ? { ...c, ...form } : c));
      } else {
        setCategories([
          ...categories,
          { ...form, id: Date.now(), deleted: false }
        ]);
      }
      setOpen(false);
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
  };

  const handleEdit = (category) => {
    setForm({ ...category });
    setEditId(category.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, deleted: true } : c));
  };

  const filteredCategories = categories.filter(c => !c.deleted);

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Product Categories</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>Add Category</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>
                    {c.active ? <Chip label="Active" color="success" /> : <Chip label="Inactive" color="default" />}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(c)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(c.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
            </Alert>
          )}
          <TextField margin="dense" label="Category Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
          <TextField margin="dense" label="User Name" name="userName" value={form.userName} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductCategories; 