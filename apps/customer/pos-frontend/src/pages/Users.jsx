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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTenant } from "../context/TenantContext";
import { useUser } from "../context/UserContext";
import { useBranch } from "../context/BranchContext"; // Import Branch context
import { authenticatedFetch } from "../utils/api";

const initialFormState = {
  name: "",
  email: "",
  password: "",
  role: "CASHIER",
  branchId: "",
};
const roles = ["ADMIN", "MANAGER", "CASHIER"];

const Users = () => {
  const { tenant } = useTenant();
  const { user: loggedInUser } = useUser();
  const { branch: loggedInUserBranch } = useBranch(); // Get the manager's own branch

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);

  const fetchData = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError("");
    try {
      // Admins need the full branch list for the dropdown. Managers don't.
      const fetchPromises = [authenticatedFetch("/api/users")];
      if (loggedInUser?.role === "ADMIN") {
        fetchPromises.push(authenticatedFetch("/api/branches"));
      }

      const [usersData, branchesData] = await Promise.all(fetchPromises);

      setUsers(usersData || []);
      setBranches(branchesData || []); // This will be undefined for Managers, which is fine.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenant, loggedInUser?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = (user = null) => {
    setIsEditing(!!user);
    const formState = user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
          branchId: user.branchId || "",
        }
      : {
          ...initialFormState,
          // If the logged-in user is a Manager, pre-fill and lock the branch to their own.
          branchId:
            loggedInUser.role === "MANAGER" ? loggedInUserBranch?.id : "",
        };
    setCurrentUser(formState);
    setFormErrors([]);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) =>
    setCurrentUser((u) => ({ ...u, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    const payload = {
      ...currentUser,
      userName: loggedInUser?.name || tenant?.name || "System"
    };
    if (isEditing && !payload.password) {
      delete payload.password;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/users/${currentUser.id}` : "/api/users";

    try {
      await authenticatedFetch(url, { method, body: JSON.stringify(payload) });
      handleClose();
      fetchData();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await authenticatedFetch(`/api/users/${id}`, { method: "DELETE" });
      fetchData();
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
        <Typography variant="h4">Users</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add User
        </Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" />
                </TableCell>
                <TableCell>{user.branch?.name || "N/A"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(user.id)}
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
        <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Name *"
            name="name"
            value={currentUser.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            margin="dense"
            label="Email *"
            name="email"
            value={currentUser.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label={isEditing ? "Password" : "Password *"}
            name="password"
            type="password"
            value={currentUser.password}
            onChange={handleChange}
            placeholder={isEditing ? "Leave blank to keep unchanged" : ""}
            fullWidth
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Role *</InputLabel>
            <Select
              label="Role *"
              name="role"
              value={currentUser.role}
              onChange={handleChange}
            >
              {/* Managers can only create/edit Cashiers */}
              {(loggedInUser.role === "ADMIN" ? roles : ["CASHIER"]).map(
                (role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          {/* A Manager can only create users in their own branch, so the field is hidden and pre-filled. */}
          {loggedInUser.role === "ADMIN" && (
            <FormControl margin="dense" fullWidth>
              <InputLabel>Branch *</InputLabel>
              <Select
                label="Branch *"
                name="branchId"
                value={currentUser.branchId || ""}
                onChange={handleChange}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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

export default Users;
