import { Box, TextField, Typography, Button, Divider, IconButton, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useTenant } from '../context/TenantContext';

const Login = () => {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    tenantName: '',
    subdomain: '',
    name: '',
    email: '',
    password: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const { setTenantAndLock } = useTenant();

  const handleLogin = async () => {
    setLoginError('');
    const subdomain = window.location.hostname.split('.')[0];
    const payload = { ...loginForm, subdomain };

    console.log('Attempting to log in with payload:', payload);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      console.log('Login successful, server response:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('tenantId', data.tenant.id);
      localStorage.setItem('tenantName', data.tenant.name);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (setTenantAndLock) setTenantAndLock(data.tenant.name);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof SyntaxError) setLoginError("Failed to parse server response. Check API URL.");
      else setLoginError(err.message);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  // --- THIS IS THE FIX ---
  const handleRegister = async () => {
    setRegisterError('');
    const payload = {
      tenant: { name: registerForm.tenantName, subdomain: registerForm.subdomain },
      user: { name: registerForm.name, email: registerForm.email, password: registerForm.password }
    };
    console.log('Attempting to register with payload:', payload);

    try {
      // 1. Corrected the API URL
      const res = await fetch('/api/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // On successful registration, automatically log the user in
      console.log('Registration successful, server response:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('tenantId', data.tenant.id);
      localStorage.setItem('tenantName', data.tenant.name);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (setTenantAndLock) setTenantAndLock(data.tenant.name);

      // Redirect to the new tenant's dashboard
      const newUrl = `http://${data.tenant.subdomain}.lvh.me:8080/dashboard`;
      window.location.href = newUrl; // Use a full redirect to change the subdomain in the URL

    } catch (err) {
      // 2. Added better error logging to see any future issues
      console.error("Registration failed:", err);
      if (err instanceof SyntaxError) setRegisterError("Failed to parse server response. Check API URL.");
      else setRegisterError(err.message);
    }
  };
  
  const handleSSO = (provider) => { alert(`SSO with ${provider} (stub)`); };

  return (
    <Box maxWidth={400} mx="auto" mt={{ xs: 6, md: 10 }} px={{ xs: 2, sm: 0 }}>
      <Typography variant="h5" mb={2}>{showRegister ? 'Register Tenant' : 'Login'}</Typography>
      <form onSubmit={e => e.preventDefault()} autoComplete="on">
        {showRegister ? (
          <>
            <TextField label="Tenant Name" name="tenantName" value={registerForm.tenantName} onChange={handleRegisterChange} fullWidth margin="normal" />
            <TextField label="Subdomain" name="subdomain" value={registerForm.subdomain} onChange={handleRegisterChange} fullWidth margin="normal" />
            <TextField label="Your Name" name="name" value={registerForm.name} onChange={handleRegisterChange} fullWidth margin="normal" autoComplete="name" />
            <TextField label="Email" name="email" value={registerForm.email} onChange={handleRegisterChange} fullWidth margin="normal" autoComplete="email" />
            <TextField label="Password" name="password" value={registerForm.password} onChange={handleRegisterChange} fullWidth margin="normal" type="password" autoComplete="new-password" />
            {registerError && <Alert severity="error" sx={{ mt: 1 }}>{registerError}</Alert>}
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleRegister}>Register & Login</Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => setShowRegister(false)}>Back to Login</Button>
          </>
        ) : (
          <>
            <TextField label="Email" fullWidth margin="normal" autoComplete="username" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
            <TextField label="Password" fullWidth margin="normal" type="password" autoComplete="current-password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            {loginError && <Alert severity="error" sx={{ mt: 1 }}>{loginError}</Alert>}
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>Login</Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => setShowRegister(true)}>Register</Button>
            <Divider sx={{ my: 2 }}>or</Divider>
            <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} sx={{ mb: 1 }} onClick={() => handleSSO('Google')}>Sign in with Google</Button>
            <Button variant="outlined" fullWidth startIcon={<FacebookIcon />} onClick={() => handleSSO('Facebook')}>Sign in with Facebook</Button>
          </>
        )}
      </form>
    </Box>
  );
};

export default Login;