import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductCategories from './pages/ProductCategories'
import Users from './pages/Users'
import Purchases from './pages/Purchases'
import Sales from './pages/Sales'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Suppliers from './pages/Suppliers'
import Branches from './pages/Branches'
import Settings from './pages/Settings'
import React from 'react';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product-categories" element={<ProductCategories />} />
        <Route path="/users" element={<Users />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
