import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  console.log('\n--- Login Request Received ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('Request Body:', req.body);

  const { email, password, subdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (!subdomain) {
    return res.status(400).json({ message: 'Subdomain is required for login' });
  }

  try {
    console.log(`[INFO] Searching for tenant with subdomain "${subdomain}".`);
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found. Check the subdomain.' });
    }
    console.log(`[INFO] Tenant "${tenant.name}" found with ID: ${tenant.id}`);

    console.log(`[INFO] Searching for user "${email}" within tenant ID ${tenant.id}.`);
    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });

    if (!user) {
      console.log(`[FAIL] No user found with email "${email}" in this tenant. Sending 401.`);
      // FIX: Specific error for user not found in this tenant
      return res.status(401).json({ message: 'Invalid credentials (user not found in this tenant)' });
    }

    console.log(`[INFO] User found: ${user.email}. Comparing password...`);
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      console.log(`[FAIL] Password for user "${email}" is incorrect. Sending 401.`);
      // FIX: Specific error for incorrect password
      return res.status(401).json({ message: 'Invalid credentials (password is incorrect)' });
    }

    console.log('[SUCCESS] Password is valid. Generating token...');
    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log(`[SUCCESS] User ${email} logged in successfully.`);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
      tenant: { id: tenant.id, name: tenant.name },
    });

  } catch (error) {
    console.error('[ERROR] An unexpected error occurred during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};