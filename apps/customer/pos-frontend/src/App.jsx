import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { TenantProvider } from './context/TenantContext';
import { BranchProvider } from './context/BranchContext';
import { UserProvider } from './context/UserContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import ProductCategories from './pages/ProductCategories';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Reports from './pages/Reports'; // 1. IMPORT THE REPORTS COMPONENT

function App() {
  const token = localStorage.getItem('token');

  return (
    <TenantProvider>
      <BranchProvider>
        <UserProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={token ? <MainLayout /> : <Navigate to="/login" />}>
                <Route index element={<Navigate to="/dashboard" />} /> 
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="branches" element={<Branches />} />
                
                {/* --- 2. FIX THE CATEGORIES PATH --- */}
                <Route path="product-categories" element={<ProductCategories />} />
                
                <Route path="products" element={<Products />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="purchases" element={<Purchases />} />
                <Route path="sales" element={<Sales />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<Settings />} />

                {/* --- 3. ADD THE MISSING REPORTS PATH --- */}
                <Route path="reports" element={<Reports />} />
              </Route>

              <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
            </Routes>
          </SettingsProvider>
        </UserProvider>
      </BranchProvider>
    </TenantProvider>
  );
}

export default App;