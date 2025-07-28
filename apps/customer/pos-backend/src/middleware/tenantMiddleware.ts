import { Request, Response, NextFunction } from 'express'; // Use the standard types

// The function signature now uses the default Express types
export default function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.tenantId) {
    req.tenant = { id: req.user.tenantId };
    next();
  } else {
    res.status(401).json({ message: 'Tenant context could not be determined from user session.' });
  }
}