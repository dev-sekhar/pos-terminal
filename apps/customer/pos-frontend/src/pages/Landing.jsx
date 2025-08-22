import React from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const pricingTiers = [
    {
      name: 'Basic',
      price: '$29/month',
      users: '5 Users',
      branches: '5 Branches',
      products: '50 Products',
      features: ['Basic Dashboard', 'Sales Management', 'Inventory Tracking', 'Email Support']
    },
    {
      name: 'Premium',
      price: '$79/month',
      users: '15 Users',
      branches: '20 Branches',
      products: '200 Products',
      features: ['Advanced Dashboard', 'Multi-branch Management', 'Advanced Reports', 'Priority Support']
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      users: 'Unlimited',
      branches: 'Unlimited',
      products: 'Unlimited',
      features: ['Custom Features', 'Dedicated Support', 'API Access', 'Custom Integrations']
    }
  ];

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            POS Terminal
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
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
            Modern POS Terminal Solution
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
                  {pricingTiers.map((tier) => (
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
                  {pricingTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Chip label={tier.users} color={tier.name === 'Enterprise' ? 'success' : 'default'} />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Max Branches</strong></TableCell>
                  {pricingTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Chip label={tier.branches} color={tier.name === 'Enterprise' ? 'success' : 'default'} />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell><strong>Max Products</strong></TableCell>
                  {pricingTiers.map((tier) => (
                    <TableCell key={tier.name} align="center">
                      <Chip label={tier.products} color={tier.name === 'Enterprise' ? 'success' : 'default'} />
                    </TableCell>
                  ))}
                </TableRow>
                {pricingTiers[0].features.map((feature, index) => (
                  <TableRow key={feature}>
                    <TableCell><strong>{feature}</strong></TableCell>
                    {pricingTiers.map((tier) => (
                      <TableCell key={tier.name} align="center">
                        {tier.features[index] ? '✅' : '❌'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  {pricingTiers.map((tier) => (
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
            © 2024 POS Terminal. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;