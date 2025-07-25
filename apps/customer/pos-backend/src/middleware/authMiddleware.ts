import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // The type definition for the decoded payload is now implicitly understood by TypeScript
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; tenantId: string };
    
    // Attach the decoded payload to the request object. Our global type file makes this valid.
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}