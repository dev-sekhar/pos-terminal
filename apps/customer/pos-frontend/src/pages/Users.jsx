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
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
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
  deleted: false,
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
  const [planLimits, setPlanLimits] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for Active, 1 for Deleted

  const fetchData = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError("");
    try {
      // Admins need the full branch list for the dropdown. Managers don't.
      const fetchPromises = [
        authenticatedFetch(`/api/users?showDeleted=${activeTab === 1}`),
        authenticatedFetch("/api/pricing/limits")
      ];
      if (loggedInUser?.role === "ADMIN") {
        fetchPromises.push(authenticatedFetch("/api/branches"));
      }

      const [usersData, limitsData, branchesData] = await Promise.all(fetchPromises);

      setUsers(usersData || []);
      setPlanLimits(limitsData);
      setBranches(branchesData || []); // This will be undefined for Managers, which is fine.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenant, loggedInUser?.role, activeTab]);

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
          deleted: user.deleted || false,
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

  const handleClose = () => {
    setOpen(false);
    setFormErrors([]); // Clear errors when dialog is closed
  };
  const handleChange = (e) =>
    setCurrentUser((u) => ({ ...u, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    // Validation: Prevent self-deactivation
    if (isEditing && currentUser.id === loggedInUser.id && currentUser.deleted) {
      setFormErrors(["You cannot deactivate your own account."]);
      return;
    }

    // Validation: Ensure at least one admin remains active
    if (isEditing && currentUser.role === "ADMIN" && currentUser.deleted) {
      const activeAdmins = users.filter(u => 
        u.role === "ADMIN" && 
        !u.deleted && 
        u.id !== currentUser.id
      );
      if (activeAdmins.length === 0) {
        setFormErrors(["Cannot deactivate the last active admin user."]);
        return;
      }
    }

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

  const isAtLimit = planLimits?.users && 
    planLimits.users.maxAllowed !== 'unlimited' && 
    planLimits.users.currentCount >= planLimits.users.maxAllowed;

  const remaining = planLimits?.users && planLimits.users.maxAllowed !== 'unlimited' 
    ? planLimits.users.maxAllowed - planLimits.users.currentCount 
    : null;

  const displayedUsers = users.filter(user => 
    activeTab === 0 ? !user.deleted : user.deleted
  );

  return (
    <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="user tabs">
          <Tab label="Active Users" />
          <Tab label="Deleted Users" />
        </Tabs>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">{activeTab === 0 ? "Active Users" : "Deleted Users"}</Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpen()}
          disabled={isAtLimit || activeTab === 1} // Disable Add User button on Deleted Users tab
        >
          Add User
        </Button>
      </Box>
      
      {planLimits?.users && (
        <Alert severity={isAtLimit ? "warning" : "info"} sx={{ mb: 2 }}>
          {planLimits.users.maxAllowed === 'unlimited' 
            ? `User usage (${planLimits.users.currentCount}/unlimited) for ${planLimits.planName} plan.`
            : isAtLimit 
              ? `User limit reached (${planLimits.users.currentCount}/${planLimits.users.maxAllowed}) for ${planLimits.planName} plan. Upgrade your plan to add more users.`
              : `User usage (${planLimits.users.currentCount}/${planLimits.users.maxAllowed}) for ${planLimits.planName} plan. You can add ${remaining} more user${remaining !== 1 ? 's' : ''}.`
          }
        </Alert>
      )}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" />
                </TableCell>
                <TableCell>{user.branch?.name || "N/A"}</TableCell>
                <TableCell>
                  {user.deleted ? (
                    <Chip label="Inactive" color="default" size="small" />
                  ) : (
                    <Chip label="Active" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpen(user)} 
                    sx={{ color: 'blue' }}
                    disabled={user.deleted || user.id === loggedInUser.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(user.id)}
                    sx={{ color: 'red' }}
                    disabled={user.deleted || user.id === loggedInUser.id}
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
          
          <FormControlLabel
            control={
              <Switch
                checked={!currentUser.deleted}
                onChange={(e) => setCurrentUser(u => ({ ...u, deleted: !e.target.checked }))}
                name="active"
                disabled={isEditing && currentUser.id === loggedInUser.id}
              />
            }
            label={isEditing && currentUser.id === loggedInUser.id ? "Active (Cannot deactivate yourself)" : "Active"}
            sx={{ mt: 2 }}
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
    </Box>
  );
};

export default Users;
