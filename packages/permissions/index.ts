// NOTE: We define roles as simple strings here. We cannot import `Role` from
// `@prisma/client` because that would make this a backend-only package.
// This is safe because both frontend and backend will import from this file.

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
} as const; // 'as const' makes these values read-only and type-safe

// This is our new single source of truth for all permissions.
export const permissions = {
  // UI Visibility Permissions
  VIEW_SALES: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  VIEW_PURCHASES: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  VIEW_PRODUCTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  VIEW_SUPPLIERS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_BRANCHES: [ROLES.ADMIN],
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_USERS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_SETTINGS: [ROLES.ADMIN],

  // Action Permissions
  MANAGE_USERS: [ROLES.ADMIN],
  MANAGE_BRANCHES: [ROLES.ADMIN], // Only admins can create/delete branches now
  MANAGE_PRODUCTS: [ROLES.ADMIN],
  MANAGE_CATEGORIES: [ROLES.ADMIN],
  MANAGE_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_PURCHASES: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_SUPPLIERS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_SETTINGS: [ROLES.ADMIN],
  CREATE_SALES: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  MANAGE_SALES_RECORDS: [ROLES.ADMIN, ROLES.MANAGER], // e.g., deleting a sale
};

// This is a helper function that can now be safely used on BOTH frontend and backend.
export const can = (userRole: string | undefined, permission: keyof typeof permissions): boolean => {
  if (!userRole) return false;
  const allowedRoles = permissions[permission];
  if (!allowedRoles) return false; // Default to deny if permission is not defined
  return (allowedRoles as readonly string[]).includes(userRole);
};