import { Drawer, List, ListItemButton, ListItemText, ListItemIcon, Collapse } from '@mui/material';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InventoryIcon from '@mui/icons-material/Inventory2';
import UserIcon from '@mui/icons-material/Person';
import SupplierIcon from '@mui/icons-material/Business';
import SalesIcon from '@mui/icons-material/PointOfSale'; // or ShoppingCart if you prefer
import PurchasesIcon from '@mui/icons-material/ShoppingBag';
import ReportsIcon from '@mui/icons-material/BarChart';

const Sidebar = () => {
  const [productsOpen, setProductsOpen] = useState(false);

  const handleProductsClick = () => {
    setProductsOpen(!productsOpen);
  };

  const links = [
    { text: 'Dashboard', path: '/dashboard', icon: <InventoryIcon /> },
    { text: 'Branches', path: '/branches', icon: <SupplierIcon /> },
    { text: 'Inventory', path: '/inventory', icon: <InventoryIcon /> },
    { text: 'Users', path: '/users', icon: <UserIcon /> },
    { text: 'Suppliers', path: '/suppliers', icon: <SupplierIcon /> },
    { text: 'Sales', path: '/sales', icon: <SalesIcon /> },
    { text: 'Purchases', path: '/purchases', icon: <PurchasesIcon /> },
    { text: 'Reports', path: '/reports', icon: <ReportsIcon /> },
  ];

  return (
    <Drawer variant="permanent" sx={{ width: 240 }}>
      <List>
        {links.slice(0, 2).map(({ text, path, icon }) => (
          <ListItemButton key={path} component={NavLink} to={path}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}

        {/* Products Section - Collapsible */}
        <ListItemButton onClick={handleProductsClick}>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
          {productsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={productsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/products">
              <ListItemIcon>
                <InventoryIcon />
              </ListItemIcon>
              <ListItemText primary="All Products" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/product-categories">
              <ListItemIcon>
                <SupplierIcon />
              </ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItemButton>
          </List>
        </Collapse>

        {links.slice(2).map(({ text, path, icon }) => (
          <ListItemButton key={path} component={NavLink} to={path}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;