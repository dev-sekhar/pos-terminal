import React, { useState, useMemo } from "react"; // <-- THIS LINE IS NOW CORRECT
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSettings } from "../context/SettingsContext";
import { useUser } from "../context/UserContext";

const defaultCurrencies = ["USD", "INR", "EUR", "GBP", "JPY"];

const Settings = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const { user } = useUser();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [feedback, setFeedback] = useState({
    isOpen: false,
    message: "",
    severity: "info",
  });
  const [newUnit, setNewUnit] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("");

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch (e) {
      return ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata"];
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const handleSimpleChange = (updateData) => {
    updateSettings({ ...settings, ...updateData });
  };

  const handleLocalizationChange = (e) => {
    const { name, value } = e.target;
    setConfirmModal({
      isOpen: true,
      title: "Confirm Global Setting Change",
      message: `Changing the ${name} will affect the entire platform for all users. Are you sure you wish to continue?`,
      onConfirm: () => handleConfirmUpdate({ [name]: value }),
    });
  };

  const handleConfirmUpdate = async (updateData) => {
    try {
      await updateSettings({ ...settings, ...updateData });
      setFeedback({
        isOpen: true,
        message: "Settings updated successfully!",
        severity: "success",
      });
    } catch (apiError) {
      setFeedback({
        isOpen: true,
        message: apiError.message || "Failed to update settings.",
        severity: "error",
      });
    } finally {
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });
  };

  const handleAddUnit = () => {
    if (newUnit && settings.units && !settings.units.includes(newUnit)) {
      handleSimpleChange({ units: [...settings.units, newUnit] });
      setNewUnit("");
    }
  };

  const handleDeleteUnit = (unit) => {
    handleSimpleChange({ units: settings.units.filter((u) => u !== unit) });
  };

  const handleAddPaymentType = () => {
    if (
      newPaymentType &&
      settings.paymentTypes &&
      !settings.paymentTypes.includes(newPaymentType)
    ) {
      handleSimpleChange({
        paymentTypes: [...settings.paymentTypes, newPaymentType],
      });
      setNewPaymentType("");
    }
  };

  const handleDeletePaymentType = (type) => {
    handleSimpleChange({
      paymentTypes: settings.paymentTypes.filter((t) => t !== type),
    });
  };

  if (loading && !settings) return <CircularProgress />;
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
          name="tenantDisplayName"
          value={settings.tenantDisplayName || ""}
          onChange={(e) =>
            handleSimpleChange({ tenantDisplayName: e.target.value })
          }
          sx={{ mt: 2, minWidth: 240 }}
          disabled={!isAdmin}
        />
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
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
                      handleSimpleChange({ logo: reader.result });
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
            Supported formats: JPG, PNG, SVG. Max size: 1MB. Recommended
            dimensions: 200x200 pixels.
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Localization</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Currency"
              name="currency"
              value={settings.currency || ""}
              onChange={handleLocalizationChange}
              fullWidth
              disabled={!isAdmin}
            >
              {defaultCurrencies.map((cur) => (
                <MenuItem key={cur} value={cur}>
                  {cur}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Timezone"
              name="timezone"
              value={settings.timezone || "UTC"}
              onChange={handleLocalizationChange}
              fullWidth
              disabled={!isAdmin}
            >
              {timezones.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
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
              {(settings.units || []).map((unit) => (
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
              {(settings.paymentTypes || []).map((type) => (
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

      <Dialog open={confirmModal.isOpen} onClose={handleModalClose}>
        <DialogTitle>{confirmModal.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmModal.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button
            onClick={confirmModal.onConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={feedback.isOpen}
        autoHideDuration={6000}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, isOpen: false })}
          severity={feedback.severity}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
