import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PieChart from "../components/PieChart";
import { useSettings } from "../context/SettingsContext";
import { useTenant } from "../context/TenantContext";
import { useBranch } from "../context/BranchContext";
import { authenticatedFetch } from "../utils/api";
import "../styles/ReportsPrint.css";

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

  const handleExportPDF = () => {
    const printContent = document.getElementById('reports-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString();
    const timeStr = currentDate.toLocaleTimeString();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Reports</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #000; margin-bottom: 8px; }
            .timestamp { color: #666; font-size: 14px; margin-bottom: 24px; }
            .summary-grid { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
            .summary-card { border: 1px solid #ddd; padding: 16px; flex: 1; min-width: 200px; }
            .chart-container { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
            .chart-card { border: 1px solid #ddd; padding: 16px; flex: 1; min-width: 300px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .chip { display: inline-block; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Business Reports</h1>
          <div class="timestamp">Generated on: ${dateStr} at ${timeStr}</div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }} id="reports-content">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="no-print">
        <Typography variant="h4">
          Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>
      </Box>
      
      
      {/* Sales Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }} className="reports-section">
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">Sales Today</Typography>
            <Typography variant="h5">
              {currency} {reportData?.summary?.salesToday?.total?.toFixed(2) || "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {reportData?.summary?.salesToday?.count || 0} transactions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">Sales This Month</Typography>
            <Typography variant="h5">
              {currency} {reportData?.summary?.salesThisMonth?.total?.toFixed(2) || "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {reportData?.summary?.salesThisMonth?.count || 0} transactions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">Sales This Year</Typography>
            <Typography variant="h5">
              {currency} {reportData?.summary?.salesThisYear?.total?.toFixed(2) || "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {reportData?.summary?.salesThisYear?.count || 0} transactions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} className="reports-section">
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <PieChart
              title="Top Products This Month"
              subtitle="Based on quantity sold"
              data={reportData?.topProducts?.map(product => ({
                label: product.productName,
                value: product.quantity
              })) || []}
            />
          </Paper>
        </Grid>

        {/* Branch-wise Sales (Admin only) */}
        {reportData?.branchSales?.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <PieChart
                title="Branch Sales This Month"
                subtitle="Based on sales value"
                data={reportData.branchSales.map(branch => ({
                  label: `${branch.branchName} (${currency}${branch.total.toFixed(0)})`,
                  value: branch.total
                }))}
              />
            </Paper>
          </Grid>
        )}

        {/* Low Stock Items */}
        <Grid item xs={12} md={reportData?.branchSales?.length > 0 ? 12 : 6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items 
              <Chip 
                label={reportData?.lowStockItems?.length || 0} 
                color={reportData?.lowStockItems?.length > 0 ? "warning" : "success"} 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Reorder Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData?.lowStockItems?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.branchName}</TableCell>
                    <TableCell align="right">{item.currentStock}</TableCell>
                    <TableCell align="right">{item.reorderLevel}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No low stock items</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }} className="page-break-before">
            <Typography variant="h6" gutterBottom>Recent Sales</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Salesperson</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData?.recentSales?.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>{sale.invoice}</TableCell>
                    <TableCell>{new Date(sale.datetime).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.salesperson}</TableCell>
                    <TableCell>{sale.branch}</TableCell>
                    <TableCell align="right">{currency} {sale.total.toFixed(2)}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No recent sales</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
