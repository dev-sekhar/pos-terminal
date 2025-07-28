import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Box } from '@mui/material'
import React from 'react';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout
