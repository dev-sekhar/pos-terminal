import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
// --- FIX 1: Import the JwtPayload interface we already defined ---
import { JwtPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // --- FIX 2: Use our single source of truth, JwtPayload, for the type assertion ---
    // This tells TypeScript to expect numbers for id and tenantId, which matches our contract.
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Now, there is no type mismatch. The assignment is valid.
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role,
      branchId: decoded.branchId
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}