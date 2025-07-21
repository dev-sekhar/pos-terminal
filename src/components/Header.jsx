import { AppBar, Toolbar, Typography, Button, Box, Select, MenuItem, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { useBranch } from '../context/BranchContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login';
  const { branch, setBranch, branches } = useBranch();
  return (
    <AppBar position="static" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          POS Terminal
        </Typography>
        <Box display="flex" alignItems="center">
          <Select
            value={branch}
            onChange={e => setBranch(e.target.value)}
            size="small"
            sx={{ mr: 2, color: 'white', borderColor: 'white', minWidth: 120, background: 'rgba(255,255,255,0.08)' }}
            variant="outlined"
            MenuProps={{
              PaperProps: {
                sx: { mt: 1, minWidth: 120 }
              }
            }}
          >
            {branches.map(b => (
              <MenuItem value={b} key={b}>{b}</MenuItem>
            ))}
          </Select>
          <Button color="inherit" onClick={() => navigate('/login')}>Logout</Button>
          {!isAuthPage && (
            <IconButton color="inherit" sx={{ ml: 1 }} onClick={() => navigate('/settings')}>
              <SettingsIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
