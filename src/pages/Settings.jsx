import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, List, ListItem, ListItemText, IconButton, Grid, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultCurrencies = ['USD', 'INR', 'EUR', 'GBP', 'JPY'];
const defaultPaymentTypes = ['Cash', 'Card', 'UPI'];

const Settings = () => {
  const [currency, setCurrency] = useState('USD');
  const [units, setUnits] = useState(['kg', 'L', 'pcs']);
  const [newUnit, setNewUnit] = useState('');
  const [paymentTypes, setPaymentTypes] = useState(() => {
    const saved = localStorage.getItem('paymentTypesList');
    return saved ? JSON.parse(saved) : defaultPaymentTypes;
  });
  const [newPaymentType, setNewPaymentType] = useState('');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('defaultCurrency');
    const savedUnits = localStorage.getItem('unitsList');
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedUnits) setUnits(JSON.parse(savedUnits));
  }, []);

  useEffect(() => {
    localStorage.setItem('defaultCurrency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('unitsList', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('paymentTypesList', JSON.stringify(paymentTypes));
  }, [paymentTypes]);

  const handleAddUnit = () => {
    if (newUnit && !units.includes(newUnit)) {
      setUnits([...units, newUnit]);
      setNewUnit('');
    }
  };
  const handleDeleteUnit = (unit) => {
    setUnits(units.filter(u => u !== unit));
  };

  const handleAddPaymentType = () => {
    if (newPaymentType && !paymentTypes.includes(newPaymentType)) {
      setPaymentTypes([...paymentTypes, newPaymentType]);
      setNewPaymentType('');
    }
  };
  const handleDeletePaymentType = (type) => {
    setPaymentTypes(paymentTypes.filter(t => t !== type));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Default Currency</Typography>
        <TextField
          select
          label="Currency"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          sx={{ mt: 2, minWidth: 120 }}
        >
          {defaultCurrencies.map(cur => (
            <MenuItem key={cur} value={cur}>{cur}</MenuItem>
          ))}
        </TextField>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Units</Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid size={{ xs: 8, sm: 6, md: 4 }}>
            <TextField
              label="Add Unit"
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              fullWidth
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUnit(); } }}
            />
          </Grid>
          <Grid>
            <Button variant="contained" onClick={handleAddUnit}>Add</Button>
          </Grid>
        </Grid>
        <List>
          {units.map(unit => (
            <ListItem key={unit} secondaryAction={
              <IconButton edge="end" onClick={() => handleDeleteUnit(unit)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={unit} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6">Payment Types</Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid size={{ xs: 8, sm: 6, md: 4 }}>
            <TextField
              label="Add Payment Type"
              value={newPaymentType}
              onChange={e => setNewPaymentType(e.target.value)}
              fullWidth
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPaymentType(); } }}
            />
          </Grid>
          <Grid>
            <Button variant="contained" onClick={handleAddPaymentType}>Add</Button>
          </Grid>
        </Grid>
        <List>
          {paymentTypes.map(type => (
            <ListItem key={type} secondaryAction={
              <IconButton edge="end" onClick={() => handleDeletePaymentType(type)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={type} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Settings; 