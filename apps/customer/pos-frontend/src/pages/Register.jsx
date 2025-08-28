import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Container,
  Paper,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { useUser } from '../context/UserContext';

const Register = () => {
  const navigate = useNavigate();
  const { setTenantAndLock } = useTenant();
  const { user, setUser } = useUser();

  const [registerForm, setRegisterForm] = useState({
    tenantName: '',
    subdomain: '',
    name: '',
    email: '',
    password: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);

  

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('tenantId', data.tenant.id);
    localStorage.setItem('tenantName', data.tenant.name);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (setTenantAndLock) setTenantAndLock(data.tenant.name);
    setUser(data.user);

    // Redirect to the new tenant's subdomain
    window.location.href = `http://${data.tenant.subdomain}.lvh.me:3000/app/dashboard`;
  };

  const handleRegister = async () => {
    setRegisterError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: {
            name: registerForm.tenantName,
            subdomain: registerForm.subdomain,
          },
          user: {
            name: registerForm.name,
            email: registerForm.email,
            password: registerForm.password,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      handleAuthSuccess(data);
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Home
      </Button>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Create Your Account
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Start your journey with our POS Terminal solution
        </Typography>

        <Box component="form" onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Company Name"
            name="tenantName"
            value={registerForm.tenantName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Subdomain"
            name="subdomain"
            value={registerForm.subdomain}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="This will be your unique identifier (e.g., yourcompany.pos-terminal.com)"
          />
          <TextField
            label="Your Full Name"
            name="name"
            value={registerForm.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoComplete="name"
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={registerForm.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={registerForm.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
          />

          {registerError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {registerError}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                sx={{ textDecoration: 'none' }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;