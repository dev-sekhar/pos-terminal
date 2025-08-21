import React, { useState, useEffect, useCallback } from "react";
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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTenant } from "../context/TenantContext";
import { useBranch } from "../context/BranchContext";
import { useUser } from "../context/UserContext";
import { authenticatedFetch } from "../utils/api";
import "../styles/Inventory.css";

const initialFormState = {
  productId: "",
  branchId: "",
  stock: "",
  reorderLevel: "",
};

const Inventory = () => {
  const { tenant } = useTenant();
  const { branch, branches, loading: branchLoading } = useBranch();
  const { user } = useUser();

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(initialFormState);

  const [formErrors, setFormErrors] = useState([]);

  const fetchData = useCallback(async () => {
    // Wait for the essential context to be ready.
    if (!tenant || !branch) return;

    setLoading(true);
    setError("");
    try {
      // These are the two essential data sets for this page.
      const [invData, prodData] = await Promise.all([
        authenticatedFetch("/api/inventory"),
        authenticatedFetch("/api/products"),
      ]);
      setInventory(invData || []);
      setProducts(prodData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenant, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = (item = null) => {
    setIsEditing(!!item);
    const formState = item
      ? { ...item }
      : { ...initialFormState, branchId: branch?.id || "" };
    setCurrentItem(formState);
    setFormErrors([]);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => ({
      ...prev,
      [name]:
        name === "stock" || name === "reorderLevel" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!currentItem.productId) errors.push("Product is required");
    if (!currentItem.branchId) errors.push("Branch is required");
    if (!currentItem.stock) errors.push("Stock quantity is required");
    if (!currentItem.reorderLevel) errors.push("Reorder level is required");
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const inventoryData = {
      branchId: currentItem.branchId,
      productId: currentItem.productId,
      stock: Number(currentItem.stock),
      reorderLevel: Number(currentItem.reorderLevel),
      userName: user?.name || tenant?.name || "System",
    };

    try {
      // Add validation before sending
      if (!inventoryData.branchId || !inventoryData.productId) {
        setFormErrors(["Please select both Product and Branch"]);
        return;
      }

      const responseData = await authenticatedFetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify(inventoryData),
      });

      console.log("Server response:", responseData);

      handleClose();
      fetchData();
    } catch (err) {
      console.error("Save operation failed:", err);
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this inventory record?")
    )
      return;
    try {
      await authenticatedFetch(`/api/inventory/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading || branchLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const lowStockAlerts = inventory.filter(
    (item) => item.stock < item.reorderLevel
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Inventory</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          disabled={loading || branchLoading}
        >
          Add Stock
        </Button>
      </Box>

      {lowStockAlerts.length > 0 && (
        <Grid container spacing={2} mb={2}>
          {lowStockAlerts.map((item) => (
            <Grid item key={item.id} xs={12} md={6} lg={4}>
              <Paper elevation={2} className="low-stock-alert">
                <Typography variant="subtitle1">🔴 Low Stock Alert</Typography>
                <Typography>
                  <strong>{item.product?.name}</strong> at{" "}
                  <strong>{item.branch?.name}</strong> has only {item.stock}{" "}
                  units left.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper>
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
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name || "N/A"}</TableCell>
                <TableCell>{item.branch?.name || "N/A"}</TableCell>
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
                  <IconButton onClick={() => handleOpen(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEditing ? "Edit Inventory" : "Add New Stock"}
        </DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}
          <FormControl fullWidth margin="dense" disabled={isEditing} required>
            <InputLabel>Product</InputLabel>
            <Select
              name="productId"
              value={currentItem.productId || ""}
              label="Product"
              onChange={handleChange}
              error={formErrors.includes("Product is required")}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" disabled={isEditing} required>
            <InputLabel>Branch</InputLabel>
            <Select
              name="branchId"
              value={currentItem.branchId || ""}
              label="Branch"
              onChange={handleChange}
              error={formErrors.includes("Branch is required")}
            >
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Stock Quantity"
            name="stock"
            value={currentItem.stock || ""}
            onChange={handleChange}
            type="number"
            fullWidth
          />
          <TextField
            margin="dense"
            label="Reorder Level"
            name="reorderLevel"
            value={currentItem.reorderLevel || ""}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? "Save Changes" : "Add Stock"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;