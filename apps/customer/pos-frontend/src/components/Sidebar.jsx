import React, { useState, useMemo } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Toolbar,
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
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BranchIcon from "@mui/icons-material/Store";
import CategoryIcon from "@mui/icons-material/Category";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useUser } from "../context/UserContext";

// --- 1. IMPORT THE TOOLS FROM OUR SINGLE SOURCE OF TRUTH ---
import { getUserPermissions, PERMISSIONS } from "@pos-terminal/permissions";

// --- 2. DEFINE NAVIGATION BASED ON PERMISSIONS, NOT ROLES ---
const navItems = [
  {
    text: "Dashboard",
    path: "/app/dashboard",
    icon: <DashboardIcon />,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    text: "Sales",
    path: "/app/sales",
    icon: <SalesIcon />,
    permission: PERMISSIONS.CREATE_SALES,
  },
  {
    text: "Products",
    icon: <InventoryIcon />,
    permission: PERMISSIONS.MANAGE_PRODUCTS, // Parent item needs a permission to be shown
    subItems: [
      {
        text: "All Products",
        path: "/app/products",
        icon: <InventoryIcon />,
        permission: PERMISSIONS.MANAGE_PRODUCTS,
      },
      {
        text: "Categories",
        path: "/app/product-categories",
        icon: <CategoryIcon />,
        permission: PERMISSIONS.MANAGE_CATEGORIES,
      },
    ],
  },
  {
    text: "Inventory",
    path: "/app/inventory",
    icon: <InventoryIcon />,
    permission: PERMISSIONS.MANAGE_INVENTORY,
  },
  {
    text: "Purchases",
    path: "/app/purchases",
    icon: <PurchasesIcon />,
    permission: PERMISSIONS.MANAGE_PURCHASES,
  },
  {
    text: "Suppliers",
    path: "/app/suppliers",
    icon: <SupplierIcon />,
    permission: PERMISSIONS.MANAGE_SUPPLIERS,
  },
  {
    text: "Reports",
    path: "/app/reports",
    icon: <ReportsIcon />,
    permission: PERMISSIONS.VIEW_REPORTS,
  },
  {
    text: "Users",
    path: "/app/users",
    icon: <UserIcon />,
    permission: PERMISSIONS.MANAGE_USERS,
  },
  {
    text: "Branches",
    path: "/app/branches",
    icon: <BranchIcon />,
    permission: PERMISSIONS.MANAGE_BRANCHES,
  },
  {
    text: "Billing",
    path: "/app/billing",
    icon: <ReceiptIcon />,
    permission: PERMISSIONS.MANAGE_BILLING,
  },

];;

const Sidebar = () => {
  const [productsOpen, setProductsOpen] = useState(false);
  const { user } = useUser();

  const handleProductsClick = () => setProductsOpen(!productsOpen);

  // --- 3. THE FILTERING LOGIC IS NOW SCALABLE AND ROBUST ---
  const accessibleNavItems = useMemo(() => {
    if (!user?.role) return [];

    // Get the full list of permission strings for the current user's role
    const userPermissions = getUserPermissions(user.role);
    
    // Debug logging
    console.log('User role:', user.role);
    console.log('User permissions:', userPermissions);
    console.log('MANAGE_BILLING permission:', PERMISSIONS.MANAGE_BILLING);
    console.log('Has billing permission:', userPermissions.includes(PERMISSIONS.MANAGE_BILLING));

    // Recursively filter the nav items and their sub-items based on the user's permissions
    const filterItems = (items) => {
      return items
        .filter((item) => {
          const hasPermission = userPermissions.includes(item.permission);
          if (item.text === 'Billing') {
            console.log('Billing item permission check:', item.permission, 'Has permission:', hasPermission);
          }
          return hasPermission;
        })
        .map((item) => {
          // If the item has sub-items, filter those as well
          if (item.subItems) {
            return { ...item, subItems: filterItems(item.subItems) };
          }
          return item;
        });
    };

    const filtered = filterItems(navItems);
    console.log('Accessible nav items:', filtered.map(item => item.text));
    return filtered;
  }, [user]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        {accessibleNavItems.map((item) => {
          // Only show the dropdown parent if there are accessible sub-items
          if (item.subItems && item.subItems.length > 0) {
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
          // Render a regular link if it has no sub-items
          if (!item.subItems) {
            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            );
          }
          return null; // Don't render a dropdown parent if none of its children are accessible
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
