import { Box, TextField, Typography, Button, Divider, IconButton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate()
  const [showRegister, setShowRegister] = useState(false);
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSSO = (provider) => {
    alert(`SSO with ${provider} (stub)`);
  };

  const handleLogin = () => {
    // In a real app, call your backend here
    // For now, mock a user based on email
    const mockUser = {
      id: email === 'admin@example.com' ? 1 : 2,
      name: email === 'admin@example.com' ? 'Admin User' : 'Regular User',
      email,
      role: email === 'admin@example.com' ? 'Admin' : 'User',
    };
    setUser(mockUser);
    navigate('/dashboard');
  };

  return (
    <Box maxWidth={400} mx="auto" mt={{ xs: 6, md: 10 }} px={{ xs: 2, sm: 0 }}>
      <Typography variant="h5" mb={2}>{showRegister ? 'Register' : 'Login'}</Typography>
      <form onSubmit={e => e.preventDefault()} autoComplete="on">
        {showRegister ? (
          <>
            <TextField label="Name" fullWidth margin="normal" autoComplete="name" />
            <TextField label="Email" fullWidth margin="normal" autoComplete="email" />
            <TextField label="Password" fullWidth margin="normal" type="password" autoComplete="new-password" />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setShowRegister(false)}>Register</Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => setShowRegister(false)}>Back to Login</Button>
          </>
        ) : (
          <>
            <TextField label="Email" fullWidth margin="normal" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" fullWidth margin="normal" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>Login</Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => setShowRegister(true)}>Register</Button>
            <Divider sx={{ my: 2 }}>or</Divider>
            <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} sx={{ mb: 1 }} onClick={() => handleSSO('Google')}>Sign in with Google</Button>
            <Button variant="outlined" fullWidth startIcon={<FacebookIcon />} onClick={() => handleSSO('Facebook')}>Sign in with Facebook</Button>
          </>
        )}
      </form>
    </Box>
  )
}

export default Login
