import { AppBar, Toolbar, Typography, Button, Box, Select, MenuItem, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { useBranch } from '../context/BranchContext';
import { useTenant } from '../context/TenantContext';
import { useSettings } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login';
  const { branch, setBranch, branches, branchLocked } = useBranch();
  const { tenant, setTenant, tenants, tenantLocked } = useTenant();
  const { settings } = useSettings();
  const { user } = useUser();

  // Debug logs
  console.log('Header debug:', {
    tenant,
    tenants,
    tenantLocked,
    branch,
    branches,
    branchLocked,
    settings,
    user,
  });

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          POS Terminal
        </Typography>
        <Box sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {settings?.logo && (
            <Box
              component="img"
              src={settings.logo}
              alt="logo"
              sx={{ height: 40, mr: 2 }}
            />
          )}
          <Typography variant="h6">
            {settings?.tenantDisplayName}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          {user && (
            <Typography sx={{ mr: 2, color: 'white' }}>
              {user.name}
            </Typography>
          )}
          <Button color="inherit" onClick={() => navigate('/login')}>Logout</Button>
          {!isAuthPage && user?.role === 'ADMIN' && (
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
