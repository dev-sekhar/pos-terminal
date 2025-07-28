import { Role } from '@prisma/client';

// This is our new single source of truth for permissions.
export const permissions = {
  // Who can see links in the sidebar
  VIEW_SALES: [Role.ADMIN, Role.MANAGER, Role.CASHIER],
  VIEW_PURCHASES: [Role.ADMIN, Role.MANAGER],
  VIEW_INVENTORY: [Role.ADMIN, Role.MANAGER, Role.CASHIER],
  VIEW_PRODUCTS: [Role.ADMIN, Role.MANAGER, Role.CASHIER],
  VIEW_SUPPLIERS: [Role.ADMIN, Role.MANAGER, Role.CASHIER],
  VIEW_BRANCHES: [Role.ADMIN, Role.MANAGER],
  VIEW_REPORTS: [Role.ADMIN, Role.MANAGER],
  VIEW_USERS: [Role.ADMIN, Role.MANAGER],
  VIEW_SETTINGS: [Role.ADMIN, Role.MANAGER],

  // Who can perform actions (Create, Update, Delete)
  MANAGE_USERS: [Role.ADMIN],
  MANAGE_BRANCHES: [Role.ADMIN, Role.MANAGER],
  MANAGE_PRODUCTS: [Role.ADMIN, Role.MANAGER],
  MANAGE_CATEGORIES: [Role.ADMIN, Role.MANAGER],
  MANAGE_INVENTORY: [Role.ADMIN, Role.MANAGER],
  MANAGE_PURCHASES: [Role.ADMIN, Role.MANAGER],
  MANAGE_SUPPLIERS: [Role.ADMIN, Role.MANAGER],
  MANAGE_SETTINGS: [Role.ADMIN],
  
  // Sales are a special case
  CREATE_SALES: [Role.ADMIN, Role.MANAGER, Role.CASHIER],
  MANAGE_SALES_RECORDS: [Role.ADMIN, Role.MANAGER], // e.g., deleting a sale
};

// We can export the roles directly for convenience
export const ALL_ROLES = [Role.ADMIN, Role.MANAGER, Role.CASHIER];