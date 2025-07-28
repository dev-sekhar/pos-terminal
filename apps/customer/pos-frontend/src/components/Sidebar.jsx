import React, { useState, useMemo } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InventoryIcon from "@mui/icons-material/Inventory2";
import UserIcon from "@mui/icons-material/Person";
import SupplierIcon from "@mui/icons-material/Business";
import SalesIcon from "@mui/icons-material/PointOfSale";
import PurchasesIcon from "@mui/icons-material/ShoppingBag";
import ReportsIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings"; // Added for settings link
import DashboardIcon from "@mui/icons-material/Dashboard"; // Added for dashboard
import BranchIcon from "@mui/icons-material/Store"; // Added for branches
import CategoryIcon from "@mui/icons-material/Category"; // Added for categories
import { useUser } from "../context/UserContext"; // 1. IMPORT THE USER CONTEXT

const navItems = [
  { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { text: "Branches", path: "/branches", icon: <BranchIcon /> },
  {
    text: "Products",
    icon: <InventoryIcon />,
    subItems: [
      { text: "All Products", path: "/products", icon: <InventoryIcon /> },
      {
        text: "Categories",
        path: "/product-categories",
        icon: <CategoryIcon />,
      },
    ],
  },
  { text: "Inventory", path: "/inventory", icon: <InventoryIcon /> },
  { text: "Sales", path: "/sales", icon: <SalesIcon /> },
  { text: "Purchases", path: "/purchases", icon: <PurchasesIcon /> },
  { text: "Suppliers", path: "/suppliers", icon: <SupplierIcon /> },
  { text: "Reports", path: "/reports", icon: <ReportsIcon /> },
  // --- THIS IS THE FIX (Part 1): Define which roles can see which links ---
  { text: "Users", path: "/users", icon: <UserIcon />, roles: ["ADMIN"] },
  {
    text: "Settings",
    path: "/settings",
    icon: <SettingsIcon />,
    roles: ["ADMIN", "MANAGER"],
  },
];

const Sidebar = () => {
  const [productsOpen, setProductsOpen] = useState(false);
  const { user } = useUser(); // 2. GET THE LOGGED-IN USER

  const handleProductsClick = () => setProductsOpen(!productsOpen);

  const accessibleNavItems = useMemo(() => {
    if (!user?.role) return []; // Return nothing if user or role is not available yet
    return navItems.filter(
      (item) => !item.roles || item.roles.includes(user.role)
    );
  }, [user]);

  return (
    <Drawer
      variant="permanent"
      sx={{ width: 240, "& .MuiDrawer-paper": { width: 240 } }}
    >
      <List>
        {accessibleNavItems.map((item) => {
          if (item.subItems) {
            return (
              <React.Fragment key={item.text}>
                <ListItemButton onClick={handleProductsClick}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {productsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={productsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((sub) => (
                      <ListItemButton
                        key={sub.path}
                        sx={{ pl: 4 }}
                        component={NavLink}
                        to={sub.path}
                      >
                        <ListItemIcon>{sub.icon}</ListItemIcon>
                        <ListItemText primary={sub.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          return (
            <ListItemButton key={item.path} component={NavLink} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
