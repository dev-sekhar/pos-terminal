import React, { useState, useMemo } from "react";
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
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardActions
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSettings } from "../context/SettingsContext";
import { useUser } from "../context/UserContext";

const defaultCurrencies = ["USD", "INR", "EUR", "GBP", "JPY"];

const dashboardWidgets = [
  { key: 'totalToday', label: 'Total Sales Today' },
  { key: 'mtdChart', label: 'Sales Chart (MTD)', note: 'Shows sales from 1st of current month to today' },
  { key: 'fytdChart', label: 'Sales Chart (FYTD)', note: 'Shows sales from start of financial year to today' },
  { key: 'topToday', label: 'Top 5 Products Today' },
  { key: 'topMonth', label: 'Top 5 Products This Month' },
  { key: 'topYear', label: 'Top 5 Products This Year' },
];

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
  const [pricingPlans, setPricingPlans] = useState([]);
  const [tenantDetails, setTenantDetails] = useState(null);

  const timezones = useMemo(() => {
    try {
      const zones = Intl.supportedValuesOf("timeZone");
      return zones.includes('UTC') ? zones : ['UTC', ...zones];
    } catch (e) {
      return ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata"];
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  // Fetch pricing plans and tenant details
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, tenantResponse] = await Promise.all([
          fetch('/api/pricing'),
          fetch('/api/billing/current-plan', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
        ]);
        
        if (plansResponse.ok) {
          const plans = await plansResponse.json();
          setPricingPlans(plans);
        }
        
        if (tenantResponse.ok) {
          const tenant = await tenantResponse.json();
          console.log('Initial tenant details loaded:', tenant);
          setTenantDetails(tenant);
        } else {
          console.error('Failed to fetch tenant details:', tenantResponse.status);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSimpleChange = async (updateData) => {
    try {
      console.log('Frontend - handleSimpleChange updateData:', JSON.stringify(updateData, null, 2));
      console.log('Frontend - Sending only updateData to backend:', JSON.stringify(updateData, null, 2));
      await updateSettings(updateData);
      setFeedback({
        isOpen: true,
        message: "Settings updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setFeedback({
        isOpen: true,
        message: err.message || "Failed to update settings.",
        severity: "error",
      });
    }
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

  const handleAddUnit = async () => {
    if (newUnit && settings.units && !settings.units.includes(newUnit)) {
      try {
        await updateSettings({ ...settings, units: [...settings.units, newUnit] });
        setNewUnit("");
        setFeedback({
          isOpen: true,
          message: "Unit added successfully!",
          severity: "success",
        });
      } catch (err) {
        setFeedback({
          isOpen: true,
          message: err.message || "Failed to add unit.",
          severity: "error",
        });
      }
    }
  };

  const handleDeleteUnit = (unit) => {
    handleSimpleChange({ units: settings.units.filter((u) => u !== unit) });
  };

  const handleAddPaymentType = async () => {
    if (
      newPaymentType &&
      settings.paymentTypes &&
      !settings.paymentTypes.includes(newPaymentType)
    ) {
      try {
        await updateSettings({ ...settings, paymentTypes: [...settings.paymentTypes, newPaymentType] });
        setNewPaymentType("");
        setFeedback({
          isOpen: true,
          message: "Payment type added successfully!",
          severity: "success",
        });
      } catch (err) {
        setFeedback({
          isOpen: true,
          message: err.message || "Failed to add payment type.",
          severity: "error",
        });
      }
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
          onBlur={(e) =>
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Financial Year Start"
              name="financialYearStart"
              value={settings.financialYearStart || "April"}
              onChange={handleLocalizationChange}
              fullWidth
              disabled={!isAdmin}
            >
              <MenuItem value="January">January</MenuItem>
              <MenuItem value="April">April</MenuItem>
              <MenuItem value="July">July</MenuItem>
              <MenuItem value="October">October</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Dashboard Widgets</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose which widgets to display on the dashboard
        </Typography>
        <Grid container spacing={2}>
          {dashboardWidgets.map((widget) => (
            <Grid item xs={12} sm={6} md={4} key={widget.key}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.dashboardWidgets?.[widget.key] ?? true}
                      onChange={(e) => {
                        console.log('Frontend - Switch clicked for:', widget.key, 'checked:', e.target.checked);
                        console.log('Frontend - Current settings:', JSON.stringify(settings, null, 2));
                        const currentWidgets = settings.dashboardWidgets || {};
                        const newDashboardWidgets = {
                          ...currentWidgets,
                          [widget.key]: e.target.checked,
                        };
                        console.log('Frontend - Updating widget:', widget.key, 'to:', e.target.checked);
                        console.log('Frontend - Current widgets:', currentWidgets);
                        console.log('Frontend - New dashboardWidgets:', newDashboardWidgets);
                        handleSimpleChange({
                          dashboardWidgets: newDashboardWidgets,
                        });
                      }}
                      disabled={!isAdmin}
                    />
                  }
                  label={widget.label}
                />
                {widget.note && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4, mt: -0.5 }}>
                    {widget.key === 'fytdChart' ? 
                      `Shows sales from ${settings.financialYearStart || 'April'} 1st to today` : 
                      widget.note
                    }
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Pricing Plans</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose your subscription plan
        </Typography>
        
        <Grid container spacing={3}>
          {pricingPlans.map((plan) => {
            const isCurrentPlan = settings.pricingPlanId === plan.id;
            const isScheduledPlan = tenantDetails?.nextPlan?.id === plan.id;
            return (
              <Grid item xs={12} sm={6} key={plan.id}>
                <Card 
                  raised={isCurrentPlan || isScheduledPlan}
                  sx={{ 
                    border: isCurrentPlan ? 2 : isScheduledPlan ? 2 : 0, 
                    borderColor: isCurrentPlan ? 'primary.main' : isScheduledPlan ? 'warning.main' : 'transparent',
                    position: 'relative'
                  }}
                >
                  {isCurrentPlan && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem' 
                      }}
                    >
                      Current
                    </Box>
                  )}
                  {isScheduledPlan && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        bgcolor: 'warning.main', 
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem' 
                      }}
                    >
                      Scheduled
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="h4" gutterBottom>{plan.name}</Typography>
                    <Typography variant="h6" gutterBottom>
                      {plan.price === null ? 'Contact Us' : plan.price === 0 ? 'Free' : `${plan.currency === 'USD' ? '$' : plan.currency}${plan.price}`}
                      {plan.price !== null && plan.price > 0 && (
                        <Typography component="span" variant="body2">/{plan.paymentFrequency}</Typography>
                      )}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>Max Users: {plan.maxUsers === null ? 'Unlimited' : plan.maxUsers}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Max Branches: {plan.maxBranches === null ? 'Unlimited' : plan.maxBranches}</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>Max Products: {plan.maxProducts === null ? 'Unlimited' : plan.maxProducts}</Typography>
                    
                    {plan.features && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Features:</Typography>
                        {plan.features.map((feature, index) => (
                          <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem' }}>• {feature}</Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                    {isCurrentPlan ? (
                      <Button variant="contained" disabled fullWidth size="large">
                        Current Plan
                      </Button>
                    ) : isScheduledPlan ? (
                      <>
                        <Button variant="contained" disabled fullWidth size="large" color="warning">
                          Change Scheduled
                        </Button>
                        {tenantDetails?.nextPlanActivationDate && (
                          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', color: 'warning.main' }}>
                            Activates: {new Date(tenantDetails.nextPlanActivationDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        size="large"
                        onClick={async () => {
                          console.log('Scheduling plan change to:', plan.id);
                          try {
                            await handleSimpleChange({ pricingPlanId: plan.id });
                            console.log('Plan change request completed');
                            
                            // Add a small delay to ensure backend processing is complete
                            setTimeout(async () => {
                              try {
                                const response = await fetch('/api/billing/current-plan', {
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                    'Content-Type': 'application/json'
                                  }
                                });
                                if (response.ok) {
                                  const tenant = await response.json();
                                  console.log('Refreshed tenant details:', tenant);
                                  setTenantDetails(tenant);
                                } else {
                                  console.error('Failed to fetch updated tenant details:', response.status);
                                }
                              } catch (error) {
                                console.error('Failed to refresh tenant details:', error);
                              }
                            }, 500);
                          } catch (error) {
                            console.error('Plan change failed:', error);
                          }
                        }}
                        disabled={!isAdmin}
                      >
                        {plan.price === null ? 'Contact Sales' : 'Schedule Change'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
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