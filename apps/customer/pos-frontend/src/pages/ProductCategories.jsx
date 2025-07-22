import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Grid, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect } from 'react';
import productCategorySchema from '../schemas/productCategorySchema';
import { Alert } from '@mui/material';
import { useTenant } from '../context/TenantContext';

const API_BASE = '/api/categories';

const ProductCategories = () => {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', active: true, userName: '' });
  const [formErrors, setFormErrors] = useState([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?tenantId=${tenant}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [tenant]);

  const handleOpen = () => {
    setForm({ name: '', description: '', active: true, userName: '' });
    setEditId(null);
    setFormErrors([]);
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
        // Update category
        const res = await fetch(`${API_BASE}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, tenantId: tenant }),
        });
        if (!res.ok) throw new Error('Failed to update category');
      } else {
        // Create category
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, tenantId: tenant, createdById: 1 }), // TODO: Replace createdById with real user id
        });
        if (!res.ok) throw new Error('Failed to create category');
      }
      setOpen(false);
      fetchCategories();
    } catch (err) {
      if (err.name === 'ValidationError') {
        setFormErrors(err.errors);
      } else {
        setFormErrors([err.message]);
      }
      return;
    }
  };

  const handleEdit = (category) => {
    setForm({ ...category });
    setEditId(category.id);
    setFormErrors([]);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}?tenantId=${tenant}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCategories = categories.filter(c => !c.deleted);

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" gutterBottom>Product Categories</Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>Add Category</Button>
        </Grid>
      </Grid>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
              {loading ? (
                <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow><TableCell colSpan={4}>No categories found.</TableCell></TableRow>
              ) : filteredCategories.map(c => (
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