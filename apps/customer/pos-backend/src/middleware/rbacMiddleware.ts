import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client'; // Import the Role enum from your generated client

// This is a higher-order function. It takes the allowed roles and returns a middleware function.
export const checkRoles = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.user is attached by the authMiddleware from the JWT payload
    const userRole = req.user?.role as Role;

    if (!userRole) {
      // This should not happen if authMiddleware is working, but it's a good safeguard.
      return res.status(403).json({ message: 'Forbidden: User role not found in session.' });
    }

    // Check if the user's role is in the list of roles allowed to access this route
    if (allowedRoles.includes(userRole)) {
      next(); // Role is allowed, proceed to the next handler
    } else {
      // Role is not allowed, send a "Forbidden" error
      res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
    }
  };
};