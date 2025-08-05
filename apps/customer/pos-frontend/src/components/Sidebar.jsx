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
import { useUser } from "../context/UserContext";

// --- FIX 1: Import the tools from our single source of truth ---
import { getUserPermissions, PERMISSIONS } from "@pos-terminal/permissions";

// --- FIX 2: Define navigation based on PERMISSIONS, not roles ---
const navItems = [
  {
    text: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    text: "Sales",
    path: "/sales",
    icon: <SalesIcon />,
    permission: PERMISSIONS.CREATE_SALES,
  },
  {
    text: "Products",
    icon: <InventoryIcon />,
    permission: PERMISSIONS.MANAGE_PRODUCTS, // Parent item also needs a permission
    subItems: [
      {
        text: "All Products",
        path: "/products",
        icon: <InventoryIcon />,
        permission: PERMISSIONS.MANAGE_PRODUCTS,
      },
      {
        text: "Categories",
        path: "/product-categories",
        icon: <CategoryIcon />,
        permission: PERMISSIONS.MANAGE_CATEGORIES,
      },
    ],
  },
  {
    text: "Inventory",
    path: "/inventory",
    icon: <InventoryIcon />,
    permission: PERMISSIONS.MANAGE_INVENTORY,
  },
  {
    text: "Purchases",
    path: "/purchases",
    icon: <PurchasesIcon />,
    permission: PERMISSIONS.MANAGE_PURCHASES,
  },
  {
    text: "Suppliers",
    path: "/suppliers",
    icon: <SupplierIcon />,
    permission: PERMISSIONS.MANAGE_SUPPLIERS,
  },
  {
    text: "Reports",
    path: "/reports",
    icon: <ReportsIcon />,
    permission: PERMISSIONS.VIEW_REPORTS,
  },
  {
    text: "Users",
    path: "/users",
    icon: <UserIcon />,
    permission: PERMISSIONS.MANAGE_USERS,
  },
  {
    text: "Branches",
    path: "/branches",
    icon: <BranchIcon />,
    permission: PERMISSIONS.MANAGE_BRANCHES,
  },
  {
    text: "Settings",
    path: "/settings",
    icon: <SettingsIcon />,
    permission: PERMISSIONS.MANAGE_SETTINGS,
  },
];

const Sidebar = () => {
  const [productsOpen, setProductsOpen] = useState(false);
  const { user } = useUser();

  const handleProductsClick = () => setProductsOpen(!productsOpen);

  // --- FIX 3: The filtering logic is now much cleaner and more robust ---
  const accessibleNavItems = useMemo(() => {
    if (!user?.role) return [];

    // Get the full list of permission strings for the current user's role
    const userPermissions = getUserPermissions(user.role);

    // Recursively filter the nav items based on the user's permissions
    const filterItems = (items) => {
      return items
        .filter((item) => userPermissions.includes(item.permission)) // Check if the user has the permission for this link
        .map((item) => {
          // If the item has sub-items, filter those as well
          if (item.subItems) {
            return { ...item, subItems: filterItems(item.subItems) };
          }
          return item;
        });
    };

    return filterItems(navItems);
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
          if (item.subItems && item.subItems.length > 0) {
            // Only show dropdown if there are accessible sub-items
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
                        onClick={() => console.log(`[Sidebar] Clicked "${sub.text}". Required permission: ${sub.permission}`)}
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
