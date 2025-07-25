import { AppBar, Toolbar, Typography, Button, Box, Select, MenuItem, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { useBranch } from '../context/BranchContext';
import { useTenant } from '../context/TenantContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login';
  const { branch, setBranch, branches, branchLocked } = useBranch();
  const { tenant, setTenant, tenants, tenantLocked } = useTenant();

  // Debug logs
  console.log('Header debug:', {
    tenant,
    tenants,
    tenantLocked,
    branch,
    branches,
    branchLocked
  });

  return (
    <AppBar position="static" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          POS Terminal
        </Typography>
        <Box display="flex" alignItems="center">
          {tenantLocked ? (
            <Typography sx={{ mr: 2, color: 'white', minWidth: 120 }}>
              {tenant}
            </Typography>
          ) : (
            <Select
              value={tenant}
              onChange={e => setTenant(e.target.value)}
              size="small"
              sx={{ mr: 2, color: 'white', borderColor: 'white', minWidth: 120, background: 'rgba(255,255,255,0.08)' }}
              variant="outlined"
              MenuProps={{
                PaperProps: {
                  sx: { mt: 1, minWidth: 120 }
                }
              }}
            >
              {tenants.map(t => (
                <MenuItem value={t} key={t}>{t}</MenuItem>
              ))}
            </Select>
          )}
          {branchLocked ? (
            <Typography sx={{ mr: 2, color: 'white', minWidth: 120 }}>
              {branch}
            </Typography>
          ) : (
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
          )}
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
