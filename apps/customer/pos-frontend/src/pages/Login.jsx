import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useTenant } from "../context/TenantContext";
import { useUser } from "../context/UserContext"; // 1. IMPORT THE useUser HOOK

const Login = () => {
  const navigate = useNavigate();
  const { setTenantAndLock } = useTenant();
  const { setUser } = useUser(); // 2. GET THE setUser FUNCTION FROM THE CONTEXT

  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    /* ... */
  });
  const [registerError, setRegisterError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    setLoginError("");
    const subdomain = window.location.hostname.split(".")[0];
    const payload = { ...loginForm, subdomain };
    console.log("Attempting to log in with payload:", payload);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      console.log("Login successful, server response:", data);

      // Store auth data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("tenantId", data.tenant.id);
      localStorage.setItem("tenantName", data.tenant.name);
      localStorage.setItem("user", JSON.stringify(data.user)); // Still useful for page refresh

      // --- THIS IS THE FIX ---
      // 3. UPDATE THE GLOBAL CONTEXT STATE
      // This immediately informs the rest of the app about the new user.
      setUser(data.user);
      // --- END OF FIX ---

      if (setTenantAndLock) setTenantAndLock(data.tenant.name);
      navigate("/dashboard");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleRegister = async () => {
    setRegisterError("");
    try {
      const res = await fetch("/api/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("tenantId", data.tenant.id);
      localStorage.setItem("tenantName", data.tenant.name);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Also update the context on registration
      setUser(data.user);

      if (setTenantAndLock) setTenantAndLock(data.tenant.name);
      navigate("/dashboard");
    } catch (err) {
      setRegisterError(err.message);
    }
  };

  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  const handleSSO = (provider) => alert(`SSO with ${provider} (stub)`);

  return (
    <Box maxWidth={400} mx="auto" mt={{ xs: 6, md: 10 }} px={{ xs: 2, sm: 0 }}>
      <Typography variant="h5" mb={2}>
        {showRegister ? "Register Tenant" : "Login"}
      </Typography>
      <form onSubmit={(e) => e.preventDefault()} autoComplete="on">
        {showRegister ? (
          <>
            <TextField
              label="Tenant Name"
              name="tenantName"
              value={registerForm.tenantName}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Subdomain"
              name="subdomain"
              value={registerForm.subdomain}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Your Name"
              name="name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              autoComplete="name"
            />
            <TextField
              label="Email"
              name="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              autoComplete="email"
            />
            <TextField
              label="Password"
              name="password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              type="password"
              autoComplete="new-password"
            />
            {registerError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {registerError}
              </Alert>
            )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleRegister}
            >
              Register & Login
            </Button>
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setShowRegister(false)}
            >
              Back to Login
            </Button>
          </>
        ) : (
          <>
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
              </Alert>
            )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setShowRegister(true)}
            >
              Register
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
          </>
        )}
      </form>
    </Box>
  );
};

export default Login;
