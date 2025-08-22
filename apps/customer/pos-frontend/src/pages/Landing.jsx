import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [loginDialog, setLoginDialog] = useState(false);
  const [domain, setDomain] = useState('');
  const [rememberDomain, setRememberDomain] = useState(false);
  const [pricingTiers, setPricingTiers] = useState([]);

  // Load saved domain preference
  useEffect(() => {
    const savedDomain = localStorage.getItem('preferredDomain');
    if (savedDomain) {
      setDomain(savedDomain);
      setRememberDomain(true);
    }
  }, [loginDialog]);

  // Fetch pricing plans
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch('/api/pricing');
        if (response.ok) {
          const plans = await response.json();
          setPricingTiers(plans);
        }
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
      }
    };
    fetchPricingPlans();
  }, []);


  const handleLogin = () => {
    if (!domain.trim()) return;
    
    // Save domain preference if remember is checked
    if (rememberDomain) {
      localStorage.setItem('preferredDomain', domain);
    }
    
    setLoginDialog(false);
    window.location.href = `http://${domain}.lvh.me:3000/login`;
  };

  const defaultPricingTiers = [
    {
      name: 'Basic',
      price: '$29/month',
      maxUsers: '5 Users',
      maxBranches: '5 Branches',
      maxProducts: '50 Products',
      features: ['Basic Dashboard', 'Sales Management', 'Inventory Tracking', 'Email Support']
    },
    {
      name: 'Premium',
      price: '$79/month',
      maxUsers: '15 Users',
      maxBranches: '20 Branches',
      maxProducts: '200 Products',
      features: ['Advanced Dashboard', 'Multi-branch Management', 'Advanced Reports', 'Priority Support']
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      maxUsers: 'Unlimited',
      maxBranches: 'Unlimited',
      maxProducts: 'Unlimited',
      features: ['Custom Features', 'Dedicated Support', 'API Access', 'Custom Integrations']
    }
  ];

  const displayTiers = pricingTiers.length > 0 ? pricingTiers.map(tier => ({
    ...tier,
    features: defaultPricingTiers.find(dt => dt.name === tier.name)?.features || []
  })) : defaultPricingTiers;

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {import.meta.env.VITE_APP_NAME || "POS Terminal"}
          </Typography>
          <Button color="inherit" onClick={() => setLoginDialog(true)}>
            Login
          </Button>
          <Button color="inherit" onClick={() => navigate('/register')} sx={{ ml: 1 }}>
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Modern {import.meta.env.VITE_APP_NAME || "POS Terminal"} Solution
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Streamline your business operations with our comprehensive point-of-sale system
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            onClick={() => navigate('/register')}
          >
            Get Started Today
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          About Our Company
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Empowering businesses with cutting-edge technology
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h5" gutterBottom color="primary">
                🚀 Innovation
              </Typography>
              <Typography>
                We leverage the latest technology to provide you with a modern, efficient POS system that grows with your business.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h5" gutterBottom color="primary">
                🛡️ Reliability
              </Typography>
              <Typography>
                Our robust infrastructure ensures your business operations run smoothly 24/7 with minimal downtime.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h5" gutterBottom color="primary">
                📞 Support
              </Typography>
              <Typography>
                Get dedicated support from our expert team to help you maximize your business potential.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Select the perfect plan for your business needs
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="h6">Features</Typography></TableCell>
                  {displayTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Typography variant="h6" color="primary">{tier.name}</Typography>
                      <Typography variant="h5" sx={{ mt: 1 }}>{tier.price}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Max Users</strong></TableCell>
                  {displayTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Chip label={tier.maxUsers} color={tier.name === 'Enterprise' ? 'success' : 'default'} />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Max Branches</strong></TableCell>
                  {displayTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Chip label={tier.maxBranches} color={tier.name === 'Enterprise' ? 'success' : 'default'} />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Max Products</strong></TableCell>
                  {displayTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Chip label={tier.maxProducts} color={tier.name === 'Enterprise' ? 'success' : 'default'} />
                    </TableCell>
                  ))}
                </TableRow>
                {displayTiers[0]?.features?.map((feature, index) => (
                  <TableRow key={feature}>
                    <TableCell><strong>{feature}</strong></TableCell>
                    {displayTiers.map((tier) => (
                      <TableCell key={tier.name} align="center">
                        {tier.features?.[index] ? '✅' : '❌'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  {displayTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Button
                        variant={tier.name === 'Premium' ? 'contained' : 'outlined'}
                        onClick={() => navigate('/register')}
                        sx={{ mt: 2 }}
                      >
                        {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, textAlign: 'center' }}>
        <Container>
          <Typography variant="body1">
            © 2024 {import.meta.env.VITE_APP_NAME || "POS Terminal"}. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Login Dialog */}
      <Dialog open={loginDialog} onClose={() => {
        setLoginDialog(false);
        setDomain('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Login to Your Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your company domain to access your POS system
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Company Domain"
            placeholder="yourcompany"
            fullWidth
            variant="outlined"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            helperText="This will redirect you to yourcompany.lvh.me:3000"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberDomain}
                onChange={(e) => setRememberDomain(e.target.checked)}
              />
            }
            label="Remember this domain"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLoginDialog(false);
            setDomain('');
          }}>Cancel</Button>
          <Button onClick={handleLogin} variant="contained" disabled={!domain.trim()}>
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Landing;