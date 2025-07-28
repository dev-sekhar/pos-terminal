import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  const { email, password, subdomain } = req.body;

  if (!email || !password || !subdomain) {
    return res.status(400).json({ message: 'Email, password, and subdomain are required.' });
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    const user = await prisma.user.findUnique({ 
      where: { tenantId_email: { tenantId: tenant.id, email } } 
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

 
    const tokenPayload = { 
      id: user.id, 
      tenantId: user.tenantId, 
      role: user.role,
      branchId: user.branchId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    console.log(`[SUCCESS] User ${email} logged in with role ${user.role} for branch ${user.branchId}.`);

    const { password: _, ...userResponse } = user;

    res.json({ 
      token,
      user: userResponse,
      tenant,
    });

  } catch (error) {
    console.error('[ERROR] An unexpected error occurred during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};