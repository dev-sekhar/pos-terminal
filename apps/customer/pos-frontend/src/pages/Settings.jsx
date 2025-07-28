import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useUser } from "../context/UserContext"; // 1. IMPORT THE USER CONTEXT

const defaultCurrencies = ["USD", "INR", "EUR", "GBP", "JPY"];

const Settings = () => {
  const { tenant } = useTenant();
  const { settings, updateSettings, loading, error } = useSettings();
  const { user } = useUser(); // 2. GET THE LOGGED-IN USER

  console.log("Settings page settings:", settings);

  const [newUnit, setNewUnit] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("");

  // 3. DETERMINE IF THE USER IS AN ADMIN
  const isAdmin = user?.role === "ADMIN";

  const handleCurrencyChange = (e) => {
    updateSettings({ ...settings, currency: e.target.value });
  };

  const handleAddUnit = () => {
    if (newUnit && !settings.units.includes(newUnit)) {
      updateSettings({ ...settings, units: [...settings.units, newUnit] });
      setNewUnit("");
    }
  };

  const handleDeleteUnit = (unit) => {
    updateSettings({
      ...settings,
      units: settings.units.filter((u) => u !== unit),
    });
  };

  const handleAddPaymentType = () => {
    if (newPaymentType && !settings.paymentTypes.includes(newPaymentType)) {
      updateSettings({
        ...settings,
        paymentTypes: [...settings.paymentTypes, newPaymentType],
      });
      setNewPaymentType("");
    }
  };

  const handleDeletePaymentType = (type) => {
    updateSettings({
      ...settings,
      paymentTypes: settings.paymentTypes.filter((t) => t !== type),
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!settings)
    return <Alert severity="warning">Could not load tenant settings.</Alert>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You are viewing settings in read-only mode. Only Administrators can
          make changes.
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Branding</Typography>
        <TextField
          label="Tenant Display Name"
          value={settings.tenantDisplayName || ""}
          onChange={(e) =>
            updateSettings({ ...settings, tenantDisplayName: e.target.value })
          }
          sx={{ mt: 2, minWidth: 240 }}
          disabled={!isAdmin}
        />
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
          <Box>
            <Button variant="contained" component="label" disabled={!isAdmin}>
              Upload Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateSettings({ ...settings, logo: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Button>
            {settings.logo && (
              <Box
                component="img"
                src={settings.logo}
                alt="logo"
                sx={{ height: 40, ml: 2, verticalAlign: "middle" }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ mt: 1 }}>
            Supported formats: JPG, PNG, SVG. Max size: 1MB. Recommended dimensions: 200x200 pixels.
          </Typography>
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Default Currency</Typography>
        <TextField
          select
          label="Currency"
          value={settings.currency}
          onChange={handleCurrencyChange}
          sx={{ mt: 2, minWidth: 120 }}
          disabled={!isAdmin} // 4. DISABLE THE CONTROL IF NOT AN ADMIN
        >
          {defaultCurrencies.map((cur) => (
            <MenuItem key={cur} value={cur}>
              {cur}
            </MenuItem>
          ))}
        </TextField>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6">Units of Measurement</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                label="Add Unit"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                size="small"
                disabled={!isAdmin}
              />
              <Button
                variant="contained"
                onClick={handleAddUnit}
                sx={{ ml: 1 }}
                disabled={!isAdmin}
              >
                Add
              </Button>
            </Box>
            <List>
              {settings.units.map((unit) => (
                <ListItem
                  key={unit}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteUnit(unit)}
                      disabled={!isAdmin}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={unit} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6">Payment Types</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                label="Add Payment Type"
                value={newPaymentType}
                onChange={(e) => setNewPaymentType(e.target.value)}
                size="small"
                disabled={!isAdmin}
              />
              <Button
                variant="contained"
                onClick={handleAddPaymentType}
                sx={{ ml: 1 }}
                disabled={!isAdmin}
              >
                Add
              </Button>
            </Box>
            <List>
              {settings.paymentTypes.map((type) => (
                <ListItem
                  key={type}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeletePaymentType(type)}
                      disabled={!isAdmin}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={type} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
