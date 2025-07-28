// This file mirrors the backend's permissions config.
// In a large-scale "monorepo" project, you could even share the permissions
// file directly between the frontend and backend.

const permissions = {
  VIEW_SALES: ["ADMIN", "MANAGER", "CASHIER"],
  VIEW_PURCHASES: ["ADMIN", "MANAGER"],
  VIEW_INVENTORY: ["ADMIN", "MANAGER", "CASHIER"],
  VIEW_PRODUCTS: ["ADMIN", "MANAGER", "CASHIER"],
  VIEW_SUPPLIERS: ["ADMIN", "MANAGER", "CASHIER"],
  VIEW_BRANCHES: ["ADMIN", "MANAGER"],
  VIEW_REPORTS: ["ADMIN", "MANAGER"],
  VIEW_USERS: ["ADMIN", "MANAGER"],
  VIEW_SETTINGS: ["ADMIN", "MANAGER"],
  MANAGE_USERS: ["ADMIN"],
  MANAGE_BRANCHES: ["ADMIN", "MANAGER"],
  MANAGE_PRODUCTS: ["ADMIN", "MANAGER"],
  MANAGE_CATEGORIES: ["ADMIN", "MANAGER"],
  MANAGE_INVENTORY: ["ADMIN", "MANAGER"],
  MANAGE_PURCHASES: ["ADMIN", "MANAGER"],
  MANAGE_SUPPLIERS: ["ADMIN", "MANAGER"],
  MANAGE_SETTINGS: ["ADMIN"],
  CREATE_SALES: ["ADMIN", "MANAGER", "CASHIER"],
  MANAGE_SALES_RECORDS: ["ADMIN", "MANAGER"],
};

// This is our new central permission-checking function for the UI.
export const can = (user, permission) => {
  if (!user?.role) return false;
  const allowedRoles = permissions[permission];
  if (!allowedRoles) return false; // Default to deny if permission doesn't exist
  return allowedRoles.includes(user.role);
};
