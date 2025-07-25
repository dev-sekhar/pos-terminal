import { Request, Response, NextFunction } from 'express';

// // Extend the User type to include tenantId
// declare global {
//   namespace Express {
//     interface User {
//       tenantId?: string;
//     }
//     interface Request {
//       tenant?: { id: string };
//     }
//   }
// }

export default function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use tenantId from authenticated user context
  if (req.user && req.user.tenantId) {
    req.tenant = { id: req.user.tenantId };
    next();
  } else {
    res.status(400).json({ error: 'Tenant context missing from user session' });
  }
}