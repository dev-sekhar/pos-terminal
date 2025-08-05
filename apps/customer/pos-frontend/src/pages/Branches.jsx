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

// --- FIX 1: Import our new centralized API utility ---
import { authenticatedFetch } from "../utils/api";

const initialFormState = { name: "", tag: "", active: true };

const Branches = () => {
  const { tenant } = useTenant();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(initialFormState);

  const [formErrors, setFormErrors] = useState([]);

  // Fetch branches from the API using our new utility
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // --- FIX 2: Use authenticatedFetch. No more manual headers! ---
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
    setCurrentBranch(
      branch
        ? {
            id: branch.id,
            name: branch.name,
            tag: branch.tag,
            active: branch.active,
          }
        : initialFormState
    );
    setFormErrors([]);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentBranch((b) => ({
      ...b,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!currentBranch.name || !currentBranch.tag) {
      setFormErrors(["Branch Name and Tag are required."]);
      return;
    }
    setFormErrors([]);

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/branches/${currentBranch.id}`
      : "/api/branches";

    try {
      // --- FIX 3: Use authenticatedFetch for saving data ---
      await authenticatedFetch(url, {
        method,
        body: JSON.stringify(currentBranch),
      });
      handleClose();
      fetchBranches(); // Re-fetch data to show changes
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;

    try {
      // --- FIX 4: Use authenticatedFetch for deleting data ---
      await authenticatedFetch(`/api/branches/${id}`, {
        method: "DELETE",
      });
      fetchBranches(); // Re-fetch data
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
        <Typography variant="h4">Branches</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Branch
        </Button>
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
                <TableCell>
                  {b.active ? (
                    <Chip label="Active" color="success" />
                  ) : (
                    <Chip label="Inactive" color="default" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(b)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(b.id)}
                    color="error"
                    disabled={b.tag === "Main"}
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
        <DialogTitle>{isEditing ? "Edit Branch" : "Add Branch"}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Branch Name"
            name="name"
            value={currentBranch.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            margin="dense"
            label="Tag"
            name="tag"
            value={currentBranch.tag}
            onChange={handleChange}
            fullWidth
            disabled={currentBranch.tag === "Main"}
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentBranch.active}
                onChange={handleChange}
                name="active"
                disabled={currentBranch.tag === "Main"}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Branches;
