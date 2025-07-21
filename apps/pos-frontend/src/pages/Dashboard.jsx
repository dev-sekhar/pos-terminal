import { Typography, Paper, Grid, Box } from '@mui/material'
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTenant } from '../context/TenantContext';

function getSalesData(tenant) {
  const saved = localStorage.getItem(`${tenant}_salesData`);
  return saved ? JSON.parse(saved) : [];
}

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function getMonth() {
  const d = new Date();
  return d.toISOString().slice(0, 7);
}
function getYear() {
  const d = new Date();
  return d.getFullYear().toString();
}
function getFYStart() {
  const d = new Date();
  const year = d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear();
  return `${year}-04-01`;
}

const Dashboard = () => {
  const { tenant } = useTenant();
  const sales = useMemo(() => getSalesData(tenant), [tenant]);
  const today = getToday();
  const month = getMonth();
  const year = getYear();
  const fyStart = getFYStart();
  const [currency, setCurrency] = React.useState('USD');
  React.useEffect(() => {
    const savedCurrency = localStorage.getItem(`${tenant}_defaultCurrency`);
    setCurrency(savedCurrency || 'USD');
  }, [tenant]);

  // Total sales today
  const totalToday = sales.filter(s => s.date === today).reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.reduce((t, i) => t + ((i.qty || 0) * (i.price || 0) * (1 - (i.discount || 0) / 100) * (1 + (i.tax || 0) / 100)), 0) : 0), 0);

  // MTD and FYTD chart data
  const mtdData = [];
  const fytdData = [];
  const daysInMonth = new Date().getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = `${month}-${String(i).padStart(2, '0')}`;
    const daySales = sales.filter(s => s.date === d).reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.reduce((t, i) => t + ((i.qty || 0) * (i.price || 0) * (1 - (i.discount || 0) / 100) * (1 + (i.tax || 0) / 100)), 0) : 0), 0);
    mtdData.push({ date: d.slice(-2), sales: daySales });
  }
  // FYTD: group by month
  for (let m = 0; m < 12; m++) {
    const d = new Date(fyStart);
    d.setMonth(d.getMonth() + m);
    if (d > new Date()) break;
    const ym = d.toISOString().slice(0, 7);
    const monthSales = sales.filter(s => s.date && s.date.startsWith(ym)).reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.reduce((t, i) => t + ((i.qty || 0) * (i.price || 0) * (1 - (i.discount || 0) / 100) * (1 + (i.tax || 0) / 100)), 0) : 0), 0);
    fytdData.push({ month: ym, sales: monthSales });
  }

  // Top 5 products for today, month, year (by sale value)
  function topProducts(filterFn) {
    const prodMap = {};
    sales.filter(filterFn).forEach(s => {
      (Array.isArray(s.items) ? s.items : []).forEach(i => {
        if (!prodMap[i.name]) prodMap[i.name] = 0;
        // Sale value: qty * price * (1 - discount) * (1 + tax)
        const value = (i.qty || 0) * (i.price || 0) * (1 - (i.discount || 0) / 100) * (1 + (i.tax || 0) / 100);
        prodMap[i.name] += value;
      });
    });
    return Object.entries(prodMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value: value.toFixed(2) }));
  }
  const topToday = topProducts(s => s.date === today);
  const topMonth = topProducts(s => s.date && s.date.startsWith(month));
  const topYear = topProducts(s => s.date && s.date.startsWith(year));

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {/* Row 1 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Total Sales Today</Typography>
            <Typography variant="h5">{currency} {totalToday.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Sales Chart (MTD)</Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={mtdData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1976d2" name="MTD Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Sales Chart (FYTD)</Typography>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={fytdData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#43a047" name="FYTD Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Row 2 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Top 5 Products Today (by Value)</Typography>
            {topToday.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{currency} {p.value}</span>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Top 5 Products This Month (by Value)</Typography>
            {topMonth.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{currency} {p.value}</span>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Top 5 Products This Year (by Value)</Typography>
            {topYear.map(p => (
              <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>{currency} {p.value}</span>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
