import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import React from "react";
import { useTenant } from "../context/TenantContext";
import { useUser } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === "/login";

  const { branding } = useTenant();
  const { user, logout } = useUser();

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          POS Terminal
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {branding?.logo && (
            <Box
              component="img"
              src={branding.logo}
              alt="logo"
              sx={{ height: 40, mr: 2 }}
            />
          )}
          <Typography variant="h6">{branding?.tenantDisplayName}</Typography>
        </Box>

        {user && (
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: 2, color: "white" }}>{user.name}</Typography>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
            {!isAuthPage && user.role === "ADMIN" && (
              <IconButton
                color="inherit"
                sx={{ ml: 1 }}
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
