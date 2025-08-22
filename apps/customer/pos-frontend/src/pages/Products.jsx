import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Grid,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import Papa from "papaparse";
import { useTenant } from "../context/TenantContext";
import { useUser } from "../context/UserContext";
import { useSettings } from "../context/SettingsContext";
import { authenticatedFetch } from "../utils/api";
import SearchBar from "../components/SearchBar";

const initialFormState = {
  name: "",
  code: "",
  productCategoryId: "",
  unit: "",
  price: "",
};

const Products = () => {
  const { tenant } = useTenant();
  const { user: loggedInUser } = useUser();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [planLimits, setPlanLimits] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialFormState);

  const [formErrors, setFormErrors] = useState([]);
  const [importDialog, setImportDialog] = useState({
    open: false,
    data: [],
    errors: [],
  });
  const fileInputRef = useRef(null);

  const fetchProductsAndCategories = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError("");
    try {
      const [productsData, categoriesData, limitsData] = await Promise.all([
        authenticatedFetch("/api/products"),
        authenticatedFetch("/api/categories"),
        authenticatedFetch("/api/pricing/limits")
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setPlanLimits(limitsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  const handleOpen = async (product = null) => {
    setIsEditing(!!product);
    setFormErrors([]);
    if (product) {
      setCurrentProduct({
        id: product.id,
        name: product.name,
        code: product.code,
        productCategoryId: product.productCategoryId,
        unit: product.unit,
        price: product.price,
      });
    } else {
      try {
        console.log('Settings:', settings);
        const response = await authenticatedFetch(
          "/api/products/utils/new-code"
        );
        const { code } = response;
        setCurrentProduct({
          ...initialFormState,
          code,
          unit: settings?.units?.[0] || "pcs",
        });
      } catch (err) {
        console.error('Error fetching product code:', err);
        setCurrentProduct({
          ...initialFormState,
          code: `P${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
          unit: "pcs"
        });
      }
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormErrors([]); // Clear errors when dialog is closed
  };
  const handleChange = (e) =>
    setCurrentProduct((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/products/${currentProduct.id}`
      : "/api/products";
    
    const productData = {
      ...currentProduct,
      userName: loggedInUser?.name || tenant?.name || "System",
    };
    
    try {
      await authenticatedFetch(url, {
        method,
        body: JSON.stringify(productData),
      });
      handleClose();
      fetchProductsAndCategories();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await authenticatedFetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProductsAndCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImportOpen = () =>
    setImportDialog({ open: true, data: [], errors: [] });
  const handleImportClose = () => {
    setImportDialog({ open: false, data: [], errors: [] });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data } = results;
        const validData = data
          .map((row) => ({
            name: row.name?.trim(),
            productCategoryId: categories.find(
              (c) => c.name.toLowerCase() === row.category?.trim().toLowerCase()
            )?.id,
            unit: row.unit || settings?.units[0] || "",
            price: parseFloat(row.price),
          }))
          .filter((p) => p.name && p.productCategoryId);
        setImportDialog({ open: true, data: validData, errors: [] });
      },
    });
  };

  const handleImportConfirm = async () => {
    try {
      const result = await authenticatedFetch("/api/products/import", {
        method: "POST",
        body: JSON.stringify({ products: importDialog.data }),
      });
      alert(`Import successful! ${result.count} products were added.`);
      handleImportClose();
      fetchProductsAndCategories();
    } catch (err) {
      setImportDialog((d) => ({ ...d, errors: [err.message] }));
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      { name: "Product Name", category: "Grocery", unit: "kg", price: "50" },
    ];
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "products_sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || settingsLoading) return <CircularProgress />;
  if (error || settingsError)
    return <Alert severity="error">{error || settingsError}</Alert>;
  if (!loggedInUser) return null;

  const canManage = loggedInUser.role === "ADMIN";
  
  const isAtLimit = planLimits?.products && 
    planLimits.products.maxAllowed !== 'unlimited' && 
    planLimits.products.currentCount >= planLimits.products.maxAllowed;

  const remaining = planLimits?.products && planLimits.products.maxAllowed !== 'unlimited' 
    ? planLimits.products.maxAllowed - planLimits.products.currentCount 
    : null;
  
  const currency = settings?.currency || '$';

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const categoryName = product.productCategory?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  // Sort products within each category by name
  Object.keys(groupedProducts).forEach(categoryName => {
    groupedProducts[categoryName].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  });

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Products</Typography>
        {canManage && (
          <Box>
            <Button
              variant="contained"
              onClick={() => handleOpen()}
              sx={{ mr: 1 }}
              disabled={isAtLimit}
            >
              Add Product
            </Button>
            <Button
              variant="outlined"
              onClick={handleImportOpen}
              startIcon={<UploadIcon />}
              disabled={isAtLimit}
            >
              Import
            </Button>
          </Box>
        )}
      </Box>
      
      {planLimits?.products && (
        <Alert severity={isAtLimit ? "warning" : "info"} sx={{ mb: 2 }}>
          {planLimits.products.maxAllowed === 'unlimited' 
            ? `Product usage (${planLimits.products.currentCount}/unlimited) for ${planLimits.planName} plan.`
            : isAtLimit 
              ? `Product limit reached (${planLimits.products.currentCount}/${planLimits.products.maxAllowed}) for ${planLimits.planName} plan. Upgrade your plan to add more products.`
              : `Product usage (${planLimits.products.currentCount}/${planLimits.products.maxAllowed}) for ${planLimits.planName} plan. You can add ${remaining} more product${remaining !== 1 ? 's' : ''}.`
          }
        </Alert>
      )}
      
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search products by name or code..."
      />
      
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Price</TableCell>
              {canManage && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupedProducts).map((categoryName) => (
              <React.Fragment key={categoryName}>
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    {categoryName}
                  </TableCell>
                </TableRow>
                {groupedProducts[categoryName].map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.productCategory?.name || "N/A"}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>
                      {currency} {p.price.toFixed(2)}
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <IconButton onClick={() => handleOpen(p)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(p.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Product Code"
            name="code"
            value={currentProduct.code}
            fullWidth
            InputProps={{ readOnly: true }}
            disabled
          />
          <TextField
            margin="dense"
            label="Product Name"
            name="name"
            value={currentProduct.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              name="productCategoryId"
              value={currentProduct.productCategoryId}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl margin="dense" fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              label="Unit"
              name="unit"
              value={currentProduct.unit}
              onChange={handleChange}
            >
              {(settings?.units || ['pcs', 'kg', 'ltr', 'box', 'pack']).map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Price"
            name="price"
            value={currentProduct.price}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={formErrors.some(error => error.includes('limit exceeded'))}
          >
            {isEditing ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={importDialog.open}
        onClose={handleImportClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Import Products from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Upload a CSV file with columns:{" "}
              <strong>name, category, unit, price</strong>
            </Typography>
            <Button
              variant="outlined"
              onClick={downloadSampleCSV}
              startIcon={<DownloadIcon />}
              sx={{ mr: 2 }}
            >
              Download Sample
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <Button
              variant="contained"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
            >
              Choose File
            </Button>
          </Box>

          {importDialog.errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Validation Errors:</Typography>
              {importDialog.errors.map((error, idx) => (
                <Typography key={idx} variant="body2">
                  Row {error.row}: {error.errors.join(", ")}
                </Typography>
              ))}
            </Alert>
          )}

          {importDialog.data.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Preview ({importDialog.data.length} products to import):
              </Typography>
              <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importDialog.data.slice(0, 10).map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {
                            categories.find(
                              (c) => c.id === product.productCategoryId
                            )?.name
                          }
                        </TableCell>
                        <TableCell>
                          {currency} {product.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportClose}>Cancel</Button>
          <Button
            onClick={handleImportConfirm}
            variant="contained"
            disabled={
              importDialog.data.length === 0 || 
              importDialog.errors.length > 0 ||
              importDialog.errors.some(error => error.includes && error.includes('limit exceeded'))
            }
          >
            Import {importDialog.data.length} Products
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;