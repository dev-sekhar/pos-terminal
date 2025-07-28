import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'; // Corrected Import Syntax
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; tenantId: string; role: Role; branchId: number };
    
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