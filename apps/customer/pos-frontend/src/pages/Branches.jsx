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
import { authenticatedFetch } from "../utils/api";
// --- THIS IS THE FIX (Part 1) ---
// Import the shared schema from the new package.
import { branchSchema } from "@pos-terminal/schemas";

const initialFormState = { name: "", tag: "", active: true };

const Branches = () => {
  const { tenant } = useTenant();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(initialFormState);
  
  // State to hold structured validation errors: { name: 'Error message', tag: '...' }
  const [formErrors, setFormErrors] = useState({});

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authenticatedFetch("/api/branches");
      setBranches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenant) {
      fetchBranches();
    }
  }, [tenant, fetchBranches]);

  const handleOpen = (branch = null) => {
    setIsEditing(!!branch);
    setCurrentBranch(branch ? { id: branch.id, name: branch.name, tag: branch.tag, active: branch.active } : initialFormState);
    setFormErrors({}); // Clear errors when opening the dialog
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentBranch((b) => ({ ...b, [name]: type === "checkbox" ? checked : value }));
    // Clear the error for the field being edited for a better UX
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // --- THIS IS THE FIX (Part 2): Client-side validation function ---
  const validateForm = async () => {
    try {
      setFormErrors({});
      await branchSchema.validate(currentBranch, { abortEarly: false });
      return true; // Validation passed
    } catch (err) {
      // Yup validation failed, transform errors into a state object
      const errors = {};
      if (err.inner) {
        err.inner.forEach(error => {
          errors[error.path] = error.message;
        });
      }
      setFormErrors(errors);
      return false; // Validation failed
    }
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/branches/${currentBranch.id}` : "/api/branches";

    try {
      await authenticatedFetch(url, {
        method,
        body: JSON.stringify(currentBranch),
      });
      handleClose();
      fetchBranches();
    } catch (err) {
      // Handle server-side errors (e.g., duplicate tag from the database)
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await authenticatedFetch(`/api/branches/${id}`, { method: "DELETE" });
      fetchBranches();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error && !open) return <Alert severity="error">{error}</Alert>; // Only show page-level error when dialog is closed

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Branches</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Branch</Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Branch Name</TableCell>
              <TableCell>Tag</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.tag}</TableCell>
                <TableCell>{b.active ? <Chip label="Active" color="success" /> : <Chip label="Inactive" color="default" />}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(b)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(b.id)} color="error" disabled={b.tag === "Main"}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Edit Branch" : "Add Branch"}</DialogTitle>
        <DialogContent>
          {error && open && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="dense"
            label="Branch Name"
            name="name"
            value={currentBranch.name}
            onChange={handleChange}
            fullWidth
            autoFocus
            // --- THIS IS THE FIX (Part 3): Display validation errors ---
            error={!!formErrors.name}
            helperText={formErrors.name || ' '}
          />
          <TextField
            margin="dense"
            label="Tag"
            name="tag"
            value={currentBranch.tag}
            onChange={handleChange}
            fullWidth
            disabled={currentBranch.tag === "Main"}
            // --- THIS IS THE FIX (Part 3): Display validation errors ---
            error={!!formErrors.tag}
            helperText={formErrors.tag || ' '}
          />
          <FormControlLabel
            control={<Switch checked={currentBranch.active} onChange={handleChange} name="active" disabled={currentBranch.tag === "Main"} />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? "Save" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Branches;