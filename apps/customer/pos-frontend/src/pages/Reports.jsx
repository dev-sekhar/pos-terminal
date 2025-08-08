import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useSettings } from "../context/SettingsContext";
import { useTenant } from "../context/TenantContext";
import { useBranch } from "../context/BranchContext";
import { authenticatedFetch } from "../utils/api";

const Reports = () => {
  const { settings } = useSettings();
  const { tenant } = useTenant();
  const { branch } = useBranch();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!tenant || !branch) return;
    setLoading(true);
    setError("");
    try {
      const data = await authenticatedFetch("/api/reports");
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenant, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const currency = settings?.currency || "$";

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Grid container spacing={2}>
        {/* --- THIS IS THE MUI v5 SYNTAX FIX --- */}
        {/* The `item` prop is no longer needed. Responsive props go directly on the Grid. */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, width: "100%", mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1">Total Sales Today</Typography>
            <Typography variant="h6">
              {currency} {reportData?.totalSalesToday?.toFixed(2) || "0.00"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, width: "100%", mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1">
              Total Purchases This Week
            </Typography>
            <Typography variant="h6">{currency} 0.00</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, width: "100%" }}>
            <Typography variant="subtitle1">Low Stock Items</Typography>
            <Typography variant="h6">
              {reportData?.lowStockItemCount || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
