import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, List, ListItem, ListItemText, IconButton, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSettings } from '../context/SettingsContext'; // IMPORT THE HOOK

const defaultCurrencies = ['USD', 'INR', 'EUR', 'GBP', 'JPY'];

const Settings = () => {
  // GET THE SETTINGS AND UPDATE FUNCTION FROM THE CONTEXT
  const { settings, updateSettings, loading, error } = useSettings();

  const [newUnit, setNewUnit] = useState('');
  const [newPaymentType, setNewPaymentType] = useState('');

  // All handle functions now call the updateSettings function from the context
  const handleCurrencyChange = (e) => {
    updateSettings({ ...settings, currency: e.target.value });
  };

  const handleAddUnit = () => {
    if (newUnit && !settings.units.includes(newUnit)) {
      updateSettings({ ...settings, units: [...settings.units, newUnit] });
      setNewUnit('');
    }
  };

  const handleDeleteUnit = (unit) => {
    updateSettings({ ...settings, units: settings.units.filter(u => u !== unit) });
  };

  const handleAddPaymentType = () => {
    if (newPaymentType && !settings.paymentTypes.includes(newPaymentType)) {
      updateSettings({ ...settings, paymentTypes: [...settings.paymentTypes, newPaymentType] });
      setNewPaymentType('');
    }
  };
  
  const handleDeletePaymentType = (type) => {
    updateSettings({ ...settings, paymentTypes: settings.paymentTypes.filter(t => t !== type) });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!settings) return <Alert severity="warning">Could not load tenant settings.</Alert>; // Guard against null settings

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Default Currency</Typography>
        <TextField select label="Currency" value={settings.currency} onChange={handleCurrencyChange} sx={{ mt: 2, minWidth: 120 }}>
          {defaultCurrencies.map(cur => <MenuItem key={cur} value={cur}>{cur}</MenuItem>)}
        </TextField>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Units of Measurement</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField label="Add Unit" value={newUnit} onChange={e => setNewUnit(e.target.value)} size="small"/>
              <Button variant="contained" onClick={handleAddUnit} sx={{ ml: 1 }}>Add</Button>
            </Box>
            <List>{settings.units.map(unit => (
              <ListItem key={unit} secondaryAction={<IconButton edge="end" onClick={() => handleDeleteUnit(unit)}><DeleteIcon /></IconButton>}>
                <ListItemText primary={unit} />
              </ListItem>
            ))}</List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Payment Types</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField label="Add Payment Type" value={newPaymentType} onChange={e => setNewPaymentType(e.target.value)} size="small"/>
              <Button variant="contained" onClick={handleAddPaymentType} sx={{ ml: 1 }}>Add</Button>
            </Box>
            <List>{settings.paymentTypes.map(type => (
              <ListItem key={type} secondaryAction={<IconButton edge="end" onClick={() => handleDeletePaymentType(type)}><DeleteIcon /></IconButton>}>
                <ListItemText primary={type} />
              </ListItem>
            ))}</List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;