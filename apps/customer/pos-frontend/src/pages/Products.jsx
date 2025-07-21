import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, Grid, Alert, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import React, { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import { useTenant } from '../context/TenantContext';
import Papa from 'papaparse';

const initialProducts = [
  { id: 1, name: 'Rice 1kg', code: 'P001', category: 'Grocery', unit: 'kg', price: 50 },
  { id: 2, name: 'Oil 1L', code: 'P002', category: 'Grocery', unit: 'L', price: 120 },
  { id: 3, name: 'Sugar 1kg', code: 'P003', category: 'Grocery', unit: 'kg', price: 60 },
];

const Products = () => {
  const { branch, branches } = useBranch();
  const { tenant } = useTenant();
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(`${tenant}_productsData`);
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '', category: '', unit: '', price: '', userName: ''
  });
  const [units, setUnits] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [importDialog, setImportDialog] = useState({ open: false, data: [], errors: [] });
  const [fileInput, setFileInput] = useState(null);

  useEffect(() => {
    const savedUnits = localStorage.getItem('unitsList');
    setUnits(savedUnits ? JSON.parse(savedUnits) : ['kg', 'L', 'pcs']);
    const savedCurrency = localStorage.getItem('defaultCurrency');
    setCurrency(savedCurrency || 'USD');
  }, [tenant]);

  useEffect(() => {
    localStorage.setItem(`${tenant}_productsData`, JSON.stringify(products));
  }, [products, tenant]);

  const handleOpen = () => {
    setForm({ name: '', code: '', category: '', unit: '', price: '', userName: '' });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = () => {
    if (editId) {
      setProducts(products.map(p => p.id === editId ? { ...p, ...form, price: Number(form.price) } : p));
    } else {
      setProducts([
        ...products,
        { ...form, id: Date.now(), price: Number(form.price) }
      ]);
    }
    setOpen(false);
  };

  const handleEdit = (product) => {
    setForm({ ...product });
    setEditId(product.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, deleted: true } : p));
  };

  // CSV Import functionality
  const handleImportOpen = () => {
    setImportDialog({ open: true, data: [], errors: [] });
  };

  const handleImportClose = () => {
    setImportDialog({ open: false, data: [], errors: [] });
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors } = results;
        const validationErrors = [];
        const validData = [];

        data.forEach((row, index) => {
          const rowErrors = [];
          
          // Validate required fields
          if (!row.name || !row.code || !row.price) {
            rowErrors.push('Missing required fields (name, code, price)');
          }
          
          // Validate price is numeric
          if (row.price && isNaN(Number(row.price))) {
            rowErrors.push('Price must be a number');
          }
          
          // Validate unit is in allowed list
          if (row.unit && !units.includes(row.unit)) {
            rowErrors.push(`Unit "${row.unit}" not in allowed units: ${units.join(', ')}`);
          }

          if (rowErrors.length > 0) {
            validationErrors.push({ row: index + 1, errors: rowErrors });
          } else {
            validData.push({
              name: row.name.trim(),
              code: row.code.trim(),
              category: row.category ? row.category.trim() : '',
              unit: row.unit || units[0],
              price: Number(row.price),
              userName: row.userName ? row.userName.trim() : ''
            });
          }
        });

        setImportDialog({ open: true, data: validData, errors: validationErrors });
      },
      error: (error) => {
        alert('Error reading file: ' + error.message);
      }
    });
  };

  const handleImportConfirm = () => {
    const newProducts = importDialog.data.map(product => ({
      ...product,
      id: Date.now() + Math.random() // Ensure unique IDs
    }));

    setProducts([...products, ...newProducts]);
    handleImportClose();
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      { name: 'Product Name', code: 'P001', category: 'Grocery', unit: 'kg', price: '50', userName: 'John Doe' },
      { name: 'Another Product', code: 'P002', category: 'Electronics', unit: 'pcs', price: '100', userName: 'Jane Smith' }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products by not deleted
  const filteredProducts = products.filter(p => !p.deleted);

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Products</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen} sx={{ mr: 1 }}>Add Product</Button>
          <Button variant="outlined" onClick={handleImportOpen} startIcon={<UploadIcon />}>Import CSV</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>{currency} {p.price}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(p)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(p.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Product Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Code" name="code" value={form.code} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Category" name="category" value={form.category} onChange={handleChange} fullWidth />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >
              {units.map(unit => (
                <MenuItem key={unit} value={unit}>{unit}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="dense" label="Price" name="price" value={form.price} onChange={handleChange} type="number" fullWidth />
          <TextField margin="dense" label="User Name" name="userName" value={form.userName} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importDialog.open} onClose={handleImportClose} fullWidth maxWidth="md">
        <DialogTitle>Import Products from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Upload a CSV file with the following columns: <strong>name, code, category, unit, price, userName</strong>
            </Typography>
            <Button 
              variant="outlined" 
              onClick={downloadSampleCSV} 
              startIcon={<DownloadIcon />}
              sx={{ mr: 2 }}
            >
              Download Sample CSV
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              ref={setFileInput}
              style={{ display: 'none' }}
            />
            <Button 
              variant="contained" 
              onClick={() => fileInput && fileInput.click()}
            >
              Choose File
            </Button>
          </Box>

          {importDialog.errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Validation Errors:</Typography>
              {importDialog.errors.map((error, idx) => (
                <Typography key={idx} variant="body2">
                  Row {error.row}: {error.errors.join(', ')}
                </Typography>
              ))}
            </Alert>
          )}

          {importDialog.data.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Preview ({importDialog.data.length} products to import):
              </Typography>
              <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importDialog.data.slice(0, 10).map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>{currency} {product.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {importDialog.data.length > 10 && (
                  <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ... and {importDialog.data.length - 10} more products
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportClose}>Cancel</Button>
          <Button 
            onClick={handleImportConfirm} 
            variant="contained"
            disabled={importDialog.data.length === 0 || importDialog.errors.length > 0}
          >
            Import {importDialog.data.length} Products
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
