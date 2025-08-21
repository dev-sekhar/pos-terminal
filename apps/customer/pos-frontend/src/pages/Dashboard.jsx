import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Grid, // --- CORRECT: Using the standard Grid component
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { authenticatedFetch } from "../utils/api";

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

  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    fetchDashboardMetrics();
  }, [tenant]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!metrics)
    return <Alert severity="warning">Could not load dashboard data.</Alert>;

  const currency = settings?.currency || "$";

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* --- FIX: 'item' prop is required for Grid v1 --- */}
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
        {/* --- FIX: 'item' prop is required for Grid v1 --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Sales Chart (MTD)</Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.mtdData} maxBarSize={60}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#1976d2" name="MTD Sales" />
              </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        {/* --- FIX: 'item' prop is required for Grid v1 --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, height: 220, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ p: 2, pb: 1, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>Sales Chart (FYTD)</Typography>
            <Box sx={{ p: 2, pt: 1, flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.fytdData} maxBarSize={60}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#43a047" name="FYTD Sales" />
              </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        {/* --- FIX: 'item' prop is required for Grid v1 --- */}
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
        {/* --- FIX: 'item' prop is required for Grid v1 --- */}
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
        {/* --- FIX: 'item' prop is required for Grid v1 --- */}
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
      </Grid>
    </Box>
  );
};

export default Dashboard;