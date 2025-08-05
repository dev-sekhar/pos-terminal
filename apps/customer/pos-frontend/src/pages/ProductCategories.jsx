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
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTenant } from "../context/TenantContext";

// --- FIX 1: Import our centralized API utility ---
import { authenticatedFetch } from "../utils/api";

const initialFormState = { name: "", description: "" };

const ProductCategories = () => {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(initialFormState);

  const [formErrors, setFormErrors] = useState([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // --- FIX 2: Use authenticatedFetch. No more manual headers! ---
      const data = await authenticatedFetch("/api/categories");
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenant) {
      fetchCategories();
    }
  }, [tenant, fetchCategories]);

  const handleOpen = (category = null) => {
    setIsEditing(!!category);
    setCurrentCategory(
      category
        ? {
            id: category.id,
            name: category.name,
            description: category.description,
          }
        : initialFormState
    );
    setFormErrors([]);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setCurrentCategory((c) => ({ ...c, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!currentCategory.name) {
      setFormErrors(["Category Name is required."]);
      return;
    }
    setFormErrors([]);

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/categories/${currentCategory.id}`
      : "/api/categories";

    try {
      // --- FIX 3: Use authenticatedFetch for saving data ---
      await authenticatedFetch(url, {
        method,
        body: JSON.stringify(currentCategory),
      });
      handleClose();
      fetchCategories();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      // --- FIX 4: Use authenticatedFetch for deleting data ---
      await authenticatedFetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      fetchCategories();
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
        <Typography variant="h4">Product Categories</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Category
        </Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>{cat.createdBy?.name || "N/A"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(cat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(cat.id)}
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Category Name"
            name="name"
            value={currentCategory.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={currentCategory.description}
            onChange={handleChange}
            fullWidth
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

export default ProductCategories;
