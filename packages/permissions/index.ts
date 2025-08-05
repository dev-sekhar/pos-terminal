// Define the user roles as a TypeScript type for strictness
export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER';

// Define all possible permission strings
// This helps with autocompletion and prevents typos
const PERMISSIONS = {
  // Tenant-level management
  MANAGE_USERS: 'manage:users',
  MANAGE_SETTINGS: 'manage:settings',
  MANAGE_BRANCHES: 'manage:branches',
  
  // Data Management (can be branch-scoped)
  MANAGE_PRODUCTS: 'manage:products',
  MANAGE_CATEGORIES: 'manage:categories',
  MANAGE_SUPPLIERS: 'manage:suppliers',
  MANAGE_INVENTORY: 'manage:inventory',
  MANAGE_PURCHASES: 'manage:purchases',
  
  // Sales
  CREATE_SALES: 'create:sales',
  
  // Reporting
  VIEW_REPORTS: 'view:reports',
  VIEW_DASHBOARD: 'view:dashboard',
} as const; // "as const" makes these values readonly and specific strings

// Map roles to their specific permissions
// This is the core logic we are centralizing
const rolePermissions: Record<Role, string[]> = {
  ADMIN: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_BRANCHES,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_PURCHASES,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
  MANAGER: [
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_PURCHASES,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
  CASHIER: [
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.VIEW_DASHBOARD, // A cashier might see a simple personal dashboard
  ],
};

/**
 * Gets the list of permission strings for a given user role.
 * @param role The role of the user ('ADMIN', 'MANAGER', 'CASHIER')
 * @returns An array of permission strings.
 */
export const getUserPermissions = (role?: Role): string[] => {
  if (!role) {
    return [];
  }
  return rolePermissions[role] || [];
};

// Also export the permissions object itself in case you need to reference a specific permission string
export { PERMISSIONS };