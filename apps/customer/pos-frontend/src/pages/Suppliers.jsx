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
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTenant } from "../context/TenantContext";

// --- FIX 1: Import our centralized API utility ---
import { authenticatedFetch } from "../utils/api";

const initialFormState = {
  name: "",
  contact: "",
  email: "",
  address: "",
  active: true,
};

const Suppliers = () => {
  const { tenant } = useTenant();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(initialFormState);

  const [formErrors, setFormErrors] = useState([]);

  // --- FIX 2: Remove the local `callApi` function ---

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // --- FIX 3: Use authenticatedFetch for data fetching ---
      const data = await authenticatedFetch("/api/suppliers");
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenant) fetchSuppliers();
  }, [tenant, fetchSuppliers]);

  const handleOpen = (supplier = null) => {
    setIsEditing(!!supplier);
    setCurrentSupplier(supplier ? {
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact || "",
      email: supplier.email || "",
      address: supplier.address || "",
      active: supplier.active
    } : initialFormState);
    setFormErrors([]);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSupplier((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!currentSupplier.name) {
      setFormErrors(["Supplier Name is required."]);
      return;
    }
    setFormErrors([]);

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/suppliers/${currentSupplier.id}` : "/api/suppliers";
      
      await authenticatedFetch(url, {
        method,
        body: JSON.stringify(currentSupplier),
      });
      handleClose();
      fetchSuppliers();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this supplier from your list?"
      )
    )
      return;
    try {
      // --- FIX 5: Use authenticatedFetch for deleting data ---
      await authenticatedFetch(`/api/suppliers/${id}`, { method: "DELETE" });
      fetchSuppliers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Suppliers</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Add Supplier
        </Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.contact}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>
                  {s.active ? (
                    <Chip label="Active" color="success" />
                  ) : (
                    <Chip label="Inactive" color="default" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(s)} title="Edit Supplier">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(s.id)}
                    color="error"
                    title="Remove Supplier"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Supplier Name"
            name="name"
            value={currentSupplier.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            margin="dense"
            label="Contact"
            name="contact"
            value={currentSupplier.contact}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={currentSupplier.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            value={currentSupplier.address}
            onChange={handleChange}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentSupplier.active}
                onChange={handleChange}
                name="active"
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? "Save" : "Add Supplier"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;
