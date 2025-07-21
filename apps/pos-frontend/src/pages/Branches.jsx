import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Grid, Switch, FormControlLabel, Chip, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect } from 'react';
import branchSchema from '../schemas/branchSchema';
import { useTenant } from '../context/TenantContext';

const initialBranches = [
  { id: 1, tag: 'Main', active: true, userName: '', deleted: false },
  { id: 2, tag: 'Branch A', active: true, userName: '', deleted: false },
];

const Branches = () => {
  const { tenant } = useTenant();
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem(`${tenant}_branchesData`);
    return saved ? JSON.parse(saved) : initialBranches;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ tag: '', active: true, userName: '' });
  const [transferDialog, setTransferDialog] = useState({ open: false, branchName: '', inventoryCount: 0 });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    localStorage.setItem(`${tenant}_branchesData`, JSON.stringify(branches));
  }, [branches, tenant]);

  const handleOpen = () => {
    setForm({ tag: '', active: true, userName: '' });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddOrEdit = async () => {
    try {
      await branchSchema.validate(form, { abortEarly: false });
      setFormErrors([]);
      if (editId) {
        const oldBranch = branches.find(b => b.id === editId);
        const newActive = form.active;
        const oldActive = oldBranch.active;
        
        // If branch is being deactivated and it was previously active
        if (!newActive && oldActive && oldBranch.tag !== 'Main') {
          // Get inventory count for this branch
          const savedInventory = localStorage.getItem(`${tenant}_inventoryData`);
          const allInventory = savedInventory ? JSON.parse(savedInventory) : [];
          const branchInventory = allInventory.filter(item => item.branch === oldBranch.tag && !item.deleted);
          
          if (branchInventory.length > 0) {
            setTransferDialog({
              open: true,
              branchName: oldBranch.tag,
              inventoryCount: branchInventory.length
            });
            return; // Don't save yet, wait for confirmation
          }
        }
        
        // If activating or no inventory to transfer, proceed normally
        setBranches(branches.map(b => b.id === editId ? { ...b, ...form } : b));
      } else {
        setBranches([
          ...branches,
          { ...form, id: Date.now(), deleted: false }
        ]);
      }
      setOpen(false);
    } catch (err) {
      setFormErrors(err.errors);
      return;
    }
  };

  const handleConfirmTransfer = () => {
    const branchToDeactivate = branches.find(b => b.tag === transferDialog.branchName);
    
    // Get current inventory
    const savedInventory = localStorage.getItem(`${tenant}_inventoryData`);
    const allInventory = savedInventory ? JSON.parse(savedInventory) : [];
    
    // Move inventory from the branch to Main
    const updatedInventory = allInventory.map(item => {
      if (item.branch === transferDialog.branchName && !item.deleted) {
        return { ...item, branch: 'Main' };
      }
      return item;
    });
    
    // Save updated inventory
    localStorage.setItem(`${tenant}_inventoryData`, JSON.stringify(updatedInventory));
    
    // Update branch status
    setBranches(branches.map(b => b.id === branchToDeactivate.id ? { ...b, active: false } : b));
    
    setTransferDialog({ open: false, branchName: '', inventoryCount: 0 });
    setOpen(false);
  };

  const handleCancelTransfer = () => {
    setTransferDialog({ open: false, branchName: '', inventoryCount: 0 });
    // Reset form to previous state
    const branch = branches.find(b => b.id === editId);
    setForm({ tag: branch.tag, active: branch.active, userName: branch.userName });
  };

  const handleEdit = (branch) => {
    setForm({ tag: branch.tag, active: branch.active, userName: branch.userName });
    setEditId(branch.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setBranches(branches.map(b => b.id === id ? { ...b, deleted: true } : b));
  };

  const filteredBranches = branches.filter(b => !b.deleted);

  return (
    <Box>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h4" gutterBottom>Branches</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" onClick={handleOpen}>Add Branch</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper sx={{ minWidth: 400 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Branch Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBranches.map(b => (
                <TableRow key={b.id}>
                  <TableCell>{b.tag}</TableCell>
                  <TableCell>
                    {b.active ? <Chip label="Active" color="success" /> : <Chip label="Inactive" color="default" />}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(b)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(b.id)} size="small" color="error" disabled={b.tag === 'Main'}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      
      {/* Main Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((msg, idx) => <div key={idx}>{msg}</div>)}
            </Alert>
          )}
          <TextField margin="dense" label="Branch Name" name="tag" value={form.tag} onChange={handleChange} fullWidth disabled={form.tag === 'Main'} />
          <TextField margin="dense" label="User Name" name="userName" value={form.userName} onChange={handleChange} fullWidth />
          <FormControlLabel
            control={<Switch checked={form.active} onChange={handleChange} name="active" color="primary" disabled={form.tag === 'Main'} />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddOrEdit} variant="contained">{editId ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Transfer Confirmation Dialog */}
      <Dialog open={transferDialog.open} onClose={handleCancelTransfer} fullWidth maxWidth="sm">
        <DialogTitle>Transfer Inventory</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to deactivate the branch "{transferDialog.branchName}".
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This branch has <strong>{transferDialog.inventoryCount}</strong> inventory items that will be moved to the Main branch.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All inventory items from "{transferDialog.branchName}" will be transferred to the Main branch. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTransfer}>Cancel</Button>
          <Button onClick={handleConfirmTransfer} variant="contained" color="primary">
            Transfer & Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Branches; 