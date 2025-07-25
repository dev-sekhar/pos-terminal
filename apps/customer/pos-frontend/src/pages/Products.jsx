import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid, Alert, Chip, CircularProgress, Select, InputLabel, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import Papa from 'papaparse';
import { useTenant } from '../context/TenantContext';

const initialFormState = { name: '', code: '', productCategoryId: '', unit: '', price: '' };
const units = ['kg', 'L', 'pcs', 'pack', 'dozen']; // Example units list

const Products = () => {
  const { tenant } = useTenant();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialFormState);
  
  const [formErrors, setFormErrors] = useState([]);
  const [importDialog, setImportDialog] = useState({ open: false, data: [], errors: [] });
  const fileInputRef = useRef(null);
  const currency = 'USD'; // This can be moved to tenant context later

  // --- API Functions ---
  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errData.message);
    }
    // Handle 204 No Content response for delete
    return response.status === 204 ? null : response.json();
  }, []);

  const fetchProductsAndCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productsData, categoriesData] = await Promise.all([
        callApi('/api/products'),
        callApi('/api/categories')
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    if (tenant) fetchProductsAndCategories();
  }, [tenant, fetchProductsAndCategories]);

  // --- Handlers ---
  const handleOpen = async (product = null) => {
    setIsEditing(!!product);
    setFormErrors([]);
    if (product) {
      setCurrentProduct({ id: product.id, name: product.name, code: product.code, productCategoryId: product.productCategoryId, unit: product.unit, price: product.price });
    } else {
      try {
        const { code } = await callApi('/api/products/utils/new-code');
        setCurrentProduct({ ...initialFormState, code });
      } catch (err) {
        setError("Could not fetch a new product code.");
        setCurrentProduct(initialFormState);
      }
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = e => setCurrentProduct(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!currentProduct.name || !currentProduct.productCategoryId || !currentProduct.price) {
      setFormErrors(["Name, Category, and Price are required."]);
      return;
    }
    setFormErrors([]);

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/products/${currentProduct.id}` : '/api/products';

    try {
      await callApi(url, { method, body: JSON.stringify(currentProduct) });
      handleClose();
      fetchProductsAndCategories();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await callApi(`/api/products/${id}`, { method: 'DELETE' });
      fetchProductsAndCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- CSV Import Handlers ---
  const handleImportOpen = () => setImportDialog({ open: true, data: [], errors: [] });
  const handleImportClose = () => setImportDialog({ open: false, data: [], errors: [] });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data } = results;
        const validData = data.map(row => ({
            name: row.name?.trim(),
            code: row.code?.trim(),
            // Find category ID from name. This is a simplification.
            productCategoryId: categories.find(c => c.name.toLowerCase() === row.category?.trim().toLowerCase())?.id,
            unit: row.unit || units[0],
            price: parseFloat(row.price),
        }));
        setImportDialog({ open: true, data: validData, errors: [] }); // Simplified validation
      },
    });
  };

  const handleImportConfirm = async () => {
    try {
      await callApi('/api/products/import', {
        method: 'POST',
        body: JSON.stringify({ products: importDialog.data }),
      });
      handleImportClose();
      fetchProductsAndCategories();
    } catch (err) {
      setImportDialog(d => ({ ...d, errors: [err.message] }));
    }
  };

  const downloadSampleCSV = () => { /* ... (code from your file) ... */ };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Products</Typography>
        <Box>
          <Button variant="contained" onClick={() => handleOpen()} sx={{ mr: 1 }}>Add Product</Button>
          <Button variant="outlined" onClick={handleImportOpen} startIcon={<UploadIcon />}>Import</Button>
        </Box>
      </Box>
      <Paper>
        <Table>
          <TableHead><TableRow>
            <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Unit</TableCell><TableCell>Price</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.code}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.productCategory?.name || 'N/A'}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell>{currency} {p.price.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(p)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(p.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.join(', ')}</Alert>}
          <TextField margin="dense" label="Product Name" name="name" value={currentProduct.name} onChange={handleChange} fullWidth autoFocus/>
          <TextField margin="dense" label="Code" name="code" value={currentProduct.code} fullWidth InputProps={{ readOnly: true }}/>
          <FormControl margin="dense" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select label="Category" name="productCategoryId" value={currentProduct.productCategoryId} onChange={handleChange}>
              {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl margin="dense" fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select label="Unit" name="unit" value={currentProduct.unit} onChange={handleChange}>
              {units.map(unit => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" label="Price" name="price" value={currentProduct.price} onChange={handleChange} type="number" fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog Here... (simplified for brevity, you can paste your full version back) */}
    </Box>
  );
};

export default Products;