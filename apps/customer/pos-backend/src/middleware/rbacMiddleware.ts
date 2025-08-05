import { Request, Response, NextFunction } from 'express'; // Import standard types
import { AuthenticatedRequest } from '../types/express';
import { getUserPermissions, Role } from '@pos-terminal/permissions';

/**
 * Creates an Express middleware for Role-Based Access Control (RBAC).
 *
 * @param requiredPermission The permission string required to access the route.
 * @returns An Express middleware function.
 */
export const rbacMiddleware = (requiredPermission: string) => {
  // THIS IS THE FIX: The returned function must use the standard (req: Request) signature.
  return (req: Request, res: Response, next: NextFunction) => {
    
    // We perform a type assertion here to access our custom properties safely.
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    // This should be caught by authMiddleware, but as a safeguard:
    if (!user) {
      return res.status(401).json({ message: 'Authentication details not found.' });
    }

    // Get the full list of permissions for the user's role from our shared package
    const userPermissions = getUserPermissions(user.role as Role);

    // Check if the user's list of permissions includes the one required for this route
    if (userPermissions.includes(requiredPermission)) {
      // User has permission, proceed to the next handler (the controller)
      return next();
    } else {
      // User does not have permission, deny access
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to perform this action.' 
      });
    }
  };
};