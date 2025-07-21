import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Grid } from '@mui/material';
import React from 'react';
import userSchema from '../schemas/userSchema';
import { useState } from 'react';
import { Alert } from '@mui/material';

const users = [
  { id: 1, name: 'Chandra', role: 'Admin', branch: 'Main' },
  { id: 2, name: 'Ravi', role: 'Salesperson', branch: 'Branch A' },
];

const Users = () => {
  const [formErrors, setFormErrors] = useState([]);
  // Add other state hooks as needed (e.g., form, users list)

  const handleAddOrEdit = async (form) => {
    try {
      await userSchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      // ...proceed
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
    // ...rest
  };

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Users</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained">Add User</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.branch}</TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      {formErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
        </Alert>
      )}
    </Box>
  );
};

export default Users;
