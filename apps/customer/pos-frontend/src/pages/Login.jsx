import { Box, TextField, Typography, Button, Divider, IconButton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

const Login = () => {
  const navigate = useNavigate()
  const [showRegister, setShowRegister] = useState(false);

  const handleSSO = (provider) => {
    alert(`SSO with ${provider} (stub)`);
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
            <TextField label="Email" fullWidth margin="normal" autoComplete="username" />
            <TextField label="Password" fullWidth margin="normal" type="password" autoComplete="current-password" />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>Login</Button>
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
