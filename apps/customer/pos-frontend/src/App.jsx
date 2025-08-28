import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useUser } from "./context/UserContext";
import { PERMISSIONS } from "@pos-terminal/permissions"; // 1. Import the PERMISSIONS object

// Import your pages and layouts
import MainLayout from "./layout/MainLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import ProductCategories from "./pages/ProductCategories";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
// import Purchases from "./pages/Purchases";
// import Sales from "./pages/Sales";
// After (The new import)
import Purchases from "./pages/purchases"; // Ensure this path matches your file structure
import Sales from "./pages/sales"; // Or './pages/sales/index.jsx'
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Billing from "./pages/Billing";
import ProtectedRoute from "./components/ProtectedRoute"; // 2. Import our new component

const AuthWrapper = () => {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AuthWrapper />}>
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Navigate to="/app/dashboard" />} />

          {/* --- 3. APPLY PERMISSION-BASED ROUTING --- */}

          {/* Accessible to ADMIN, MANAGER, CASHIER */}
          <Route
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_DASHBOARD} />
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_SALES} />
            }
          >
            <Route path="sales" element={<Sales />} />
          </Route>

          {/* Accessible to ADMIN, MANAGER */}
          <Route
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.MANAGE_PRODUCTS}
              />
            }
          >
            <Route path="products" element={<Products />} />
            <Route path="product-categories" element={<ProductCategories />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.MANAGE_INVENTORY}
              />
            }
          >
            <Route path="inventory" element={<Inventory />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.MANAGE_PURCHASES}
              />
            }
          >
            <Route path="purchases" element={<Purchases />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.MANAGE_SUPPLIERS}
              />
            }
          >
            <Route path="suppliers" element={<Suppliers />} />
          </Route>
          <Route
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_REPORTS} />
            }
          >
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Accessible only to ADMIN */}
          <Route
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS} />
            }
          >
            <Route path="users" element={<Users />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.MANAGE_BRANCHES}
              />
            }
          >
            <Route path="branches" element={<Branches />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.MANAGE_SETTINGS}
              />
            }
          >
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_SETTINGS} />
            }
          >
            <Route path="billing" element={<Billing />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
