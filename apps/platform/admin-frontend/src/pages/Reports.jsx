import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress, Alert, TextField, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Layout from '../components/Layout';
import { authenticatedFetch } from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [tenantGrowthData, setTenantGrowthData] = useState([]);
  const [tenantEngagementData, setTenantEngagementData] = useState([]);
  const [mrrData, setMrrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const [sales, products, categories, tenantGrowth, tenantEngagement, mrr] = await Promise.all([
        authenticatedFetch(`/api/reports/sales?${params.toString()}`),
        authenticatedFetch(`/api/reports/top-products?${params.toString()}`),
        authenticatedFetch(`/api/reports/sales-by-category?${params.toString()}`),
        authenticatedFetch(`/api/reports/tenant-growth?${params.toString()}`),
        authenticatedFetch(`/api/reports/tenant-engagement?${params.toString()}`),
        authenticatedFetch(`/api/reports/mrr?${params.toString()}`),
      ]);
      setSalesData(sales);
      setTopProductsData(products);
      setCategoryData(categories);
      setTenantGrowthData(tenantGrowth);
      setTenantEngagementData(tenantEngagement);
      setMrrData(mrr);
    } catch (err) {
      setError('Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Reports
          </Typography>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
              <Grid item>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={handleFilter}>Filter</Button>
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ '&::before': { display: 'none' } }}>TENANT GROWTH & ACTIVITY</Typography>
                {tenantGrowthData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={tenantGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="newTenants" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="activeTenants" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                      This chart shows the number of new and active tenants over time.
                    </Typography>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography>No tenant growth data available.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ '&::before': { display: 'none' } }}>TENANT ENGAGEMENT</Typography>
                {tenantEngagementData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={tenantEngagementData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="transactions" barSize={20}>
                          {tenantEngagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                      This chart shows the number of transactions per tenant.
                    </Typography>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography>No tenant engagement data available.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ '&::before': { display: 'none' } }}>MONTHLY RECURRING REVENUE</Typography>
                {mrrData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mrrData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="mrr" barSize={20}>
                          {mrrData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                      This chart shows the Monthly Recurring Revenue.
                    </Typography>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography>No MRR data available.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ '&::before': { display: 'none' } }}>SALES OVERVIEW</Typography>
                {salesData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" barSize={20}>
                          {salesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                      This chart provides an overview of sales data.
                    </Typography>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography>No sales data available.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ '&::before': { display: 'none' } }}>SALES BY CATEGORY</Typography>
                {categoryData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                      This chart shows the distribution of sales across different categories.
                    </Typography>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography>No category data available.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ '&::before': { display: 'none' } }}>TOP SELLING PRODUCTS</Typography>
                {topProductsData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProductsData} layout="vertical" barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip />
                        <Bar dataKey="sales" barSize={20}>
                          {topProductsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                      This chart displays the top-selling products.
                    </Typography>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography>No top products data available.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </LocalizationProvider>
    </Layout>
  );
};

export default Reports;