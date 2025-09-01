import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  role: 'ADMIN',
  active: true,
};

const Users = () => {
  const { user: loggedInUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState(0); // 0 for Active, 1 for Deleted

  useEffect(() => {
    fetchEmployees();
  }, [activeTab]); // Add activeTab to dependency array

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(`http://localhost:5002/api/employees?showDeleted=${activeTab === 1}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (employee = null) => {
    setIsEditing(!!employee);
    setCurrentEmployee(employee || initialFormState);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentEmployee(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEmployee((s) => ({
      ...s,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `http://localhost:5002/api/employees/${currentEmployee.id}`
        : 'http://localhost:5002/api/employees';

      const payload = { ...currentEmployee };
      if (!isEditing) {
        // Only send password when creating
        if (!payload.password) {
          setError('Password is required for new employees.');
          return;
        }
      } else {
        delete payload.password; // Don't send password on update
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        handleClose();
        fetchEmployees();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to save employee');
      }
    } catch (err) {
      setError('Error saving employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('employeeToken');
        await fetch(`http://localhost:5002/api/employees/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        fetchEmployees();
      } catch (err) {
        setError('Error deleting employee');
      }
    }
  };

  const displayedEmployees = employees.filter(employee => 
    activeTab === 0 ? employee.active : !employee.active
  );

  return (
    <Layout>
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
          <Typography variant="h4" gutterBottom>
            {activeTab === 0 ? "Active Admin Users" : "Deleted Admin Users"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            disabled={activeTab === 1} // Disable Add User button on Deleted Users tab
          >
            Add Employee
          </Button>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {employee.active ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleOpen(employee)} 
                        sx={{ color: 'blue' }}
                        disabled={!employee.active || employee.id === loggedInUser.id}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(employee.id)} 
                        sx={{ color: 'red' }}
                        disabled={!employee.active || employee.id === loggedInUser.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{isEditing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={currentEmployee.name}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={currentEmployee.email}
              onChange={handleChange}
            />
            {!isEditing && (
              <TextField
                margin="dense"
                name="password"
                label="Password"
                type="password"
                fullWidth
                value={currentEmployee.password}
                onChange={handleChange}
              />
            )}
            <TextField
              margin="dense"
              name="role"
              label="Role"
              type="text"
              fullWidth
              value={currentEmployee.role}
              onChange={handleChange}
            />
            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={currentEmployee.active}
                    onChange={handleChange}
                    name="active"
                  />
                }
                label="Active"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Users;