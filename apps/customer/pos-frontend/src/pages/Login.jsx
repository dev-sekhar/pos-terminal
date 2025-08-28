import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react"; // 1. Import useEffect
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTenant } from "../context/TenantContext";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { setTenantAndLock } = useTenant();
  const { user, setUser } = useUser(); // 2. Get the user object as well


  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // 3. This effect handles navigation safely after state has been updated.
  useEffect(() => {
    // If the user object exists in the context, it means login/registration was successful.
    // Now it is safe to navigate to the dashboard.
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]); // This runs only when the user state changes.

  // 4. Create a helper to handle success logic, reducing duplication.
  const handleAuthSuccess = (data) => {
    // Store auth data in localStorage or sessionStorage based on remember me
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    storage.setItem("tenantId", data.tenant.id);
    storage.setItem("tenantName", data.tenant.name);
    storage.setItem("user", JSON.stringify(data.user));
    
    // Also store in localStorage for context to work properly
    if (!rememberMe) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("tenantId", data.tenant.id);
      localStorage.setItem("tenantName", data.tenant.name);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    // Update global context state. This will trigger the useEffect hook.
    if (setTenantAndLock) setTenantAndLock(data.tenant.name);
    setUser(data.user);
  };

  const handleLogin = async () => {
    setLoginError("");
    const subdomain = window.location.hostname.split(".")[0];
    const payload = { ...loginForm, subdomain };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // 5. Call the centralized success handler.
      handleAuthSuccess(data);
    } catch (err) {
      setLoginError(err.message);
    }
  };




  const handleSSO = (provider) => alert(`SSO with ${provider} (stub)`);

  return (
    <Box maxWidth={400} mx="auto" mt={{ xs: 6, md: 10 }} px={{ xs: 2, sm: 0 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Home
      </Button>
      <Typography variant="h5" mb={2}>
        Login
      </Typography>
      <form onSubmit={(e) => e.preventDefault()} autoComplete="on">
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          autoComplete="username"
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
        />
        <TextField
          label="Password"
          fullWidth
          margin="normal"
          type="password"
          autoComplete="current-password"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
        />
        {loginError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {loginError}
            {loginError.includes("Tenant not found") && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  This subdomain is not registered. Would you like to create a new account?
                </Typography>
              </Box>
            )}
          </Alert>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          }
          label="Keep me logged in"
          sx={{ mt: 1 }}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
          disabled={loginError.includes("Tenant not found")}
        >
          Login
        </Button>
        <Button
          fullWidth
          sx={{ 
            mt: 1,
            ...(loginError.includes("Tenant not found") && {
              variant: "contained",
              color: "secondary",
              fontWeight: "bold"
            })
          }}
          variant={loginError.includes("Tenant not found") ? "contained" : "text"}
          color={loginError.includes("Tenant not found") ? "secondary" : "primary"}
          onClick={() => window.location.href = 'http://lvh.me:3000/register'}
        >
          Create New Account
        </Button>
        <Divider sx={{ my: 2 }}>or</Divider>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          sx={{ mb: 1 }}
          onClick={() => handleSSO("Google")}
        >
          Sign in with Google
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<FacebookIcon />}
          onClick={() => handleSSO("Facebook")}
        >
          Sign in with Facebook
        </Button>
      </form>
    </Box>
  );
};

export default Login;
