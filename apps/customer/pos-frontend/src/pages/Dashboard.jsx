import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Grid, // --- CORRECT: Using the standard Grid component
  Box,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Warning, Payment } from "@mui/icons-material";
import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { authenticatedFetch } from "../utils/api";
import { useNavigate } from "react-router-dom";

const initialMetrics = {
  totalToday: 0,
  mtdData: [],
  fytdData: [],
  topToday: [],
  topMonth: [],
  topYear: [],
};

const Dashboard = () => {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const widgetSettings = settings?.dashboardWidgets || {};

  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentAlert, setPaymentAlert] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!tenant) return;
      setLoading(true);
      setError("");
      try {
        const data = await authenticatedFetch("/api/dashboard/metrics");
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Load payment status from localStorage
    const storedPaymentAlert = localStorage.getItem("paymentAlert");
    const storedPaymentStatus = localStorage.getItem("paymentStatus");
    
    if (storedPaymentAlert) {
      setPaymentAlert(JSON.parse(storedPaymentAlert));
    }
    if (storedPaymentStatus) {
      setPaymentStatus(JSON.parse(storedPaymentStatus));
    }
    
    fetchDashboardMetrics();
  }, [tenant]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!metrics)
    return <Alert severity="warning">Could not load dashboard data.</Alert>;

  const currency = settings?.currency || "$";

  const getPaymentAlertSeverity = () => {
    if (!paymentAlert) return 'info';
    if (paymentAlert.stage === 'blocked') return 'error';
    if (paymentAlert.stage === 'readonly') return 'warning';
    return paymentAlert.isUrgent ? 'warning' : 'info';
  };

  const getPaymentAlertMessage = () => {
    if (!paymentAlert) return '';
    
    const currency = settings?.currency || '$';
    const amount = `${currency}${paymentAlert.totalOverdue?.toFixed(2) || '0.00'}`;
    
    if (paymentAlert.stage === 'readonly') {
      return `Payment overdue: ${amount}. System is in read-only mode. Add/edit functions are disabled.`;
    }
    if (paymentAlert.stage === 'normal' && paymentAlert.isUrgent) {
      return `Payment overdue: ${amount}. Please make payment to avoid service restrictions.`;
    }
    return `Payment overdue: ${amount}. Please make payment to keep your account active.`;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Payment Status Alert */}
      {paymentAlert && (
        <Alert 
          severity={getPaymentAlertSeverity()}
          icon={<Warning />}
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<Payment />}
              onClick={() => navigate('/app/billing')}
            >
              Make Payment
            </Button>
          }
        >
          {getPaymentAlertMessage()}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Total Sales Today Widget */}
        {widgetSettings.totalToday !== false && (
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 0,
              height: 220,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Total Sales Today</Typography>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
              <Typography variant="h4">
                {currency} {(metrics.totalToday || 0).toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        )}
        {/* MTD Chart Widget */}
        {widgetSettings.mtdChart !== false && (
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Sales Chart (MTD)</Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={140}>
              <BarChart data={metrics.mtdData} maxBarSize={60}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#1976d2" name="MTD Sales" />
              </BarChart>
              </ResponsiveContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.7rem' }}>
                Shows sales from 1st of current month to today
              </Typography>
            </Box>
          </Paper>
        </Grid>
        )}
        {/* FYTD Chart Widget */}
        {widgetSettings.fytdChart !== false && (
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Sales Chart (FYTD)</Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={140}>
              <BarChart data={metrics.fytdData} maxBarSize={60}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#43a047" name="FYTD Sales" />
              </BarChart>
              </ResponsiveContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.7rem' }}>
                Shows sales from {settings?.financialYearStart || 'April'} 1st to today
              </Typography>
            </Box>
          </Paper>
        </Grid>
        )}
        {/* Top Products Today Widget */}
        {widgetSettings.topToday !== false && (
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Top 5 Products Today</Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1, overflow: 'auto' }}>
              {(metrics.topToday || []).map((p) => (
                <Box
                  key={p.name}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <span>{p.name}</span>
                  <span>
                    {currency} {p.value}
                  </span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        )}
        {/* Top Products Month Widget */}
        {widgetSettings.topMonth !== false && (
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
              Top 5 Products This Month
            </Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1, overflow: 'auto' }}>
              {(metrics.topMonth || []).map((p) => (
                <Box
                  key={p.name}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <span>{p.name}</span>
                  <span>
                    {currency} {p.value}
                  </span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        )}
        {/* Top Products Year Widget */}
        {widgetSettings.topYear !== false && (
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
              Top 5 Products This Year
            </Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1, overflow: 'auto' }}>
              {(metrics.topYear || []).map((p) => (
                <Box
                  key={p.name}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <span>{p.name}</span>
                  <span>
                    {currency} {p.value}
                  </span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;