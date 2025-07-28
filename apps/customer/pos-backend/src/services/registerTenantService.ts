import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const registerTenant = async (tenantData: any, userData: any) => {
  const tenant = await prisma.tenant.create({ 
    data: { name: tenantData.name, subdomain: tenantData.subdomain } 
  });

  const mainBranch = await prisma.branch.create({ 
    data: { name: 'Main', tag: 'Main', tenantId: tenant.id, createdById: undefined } 
  });

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({ 
    data: { 
      ...userData, 
      password: hashedPassword, 
      tenantId: tenant.id, 
      branchId: mainBranch.id, 
      role: 'ADMIN' 
    } 
  });

  const tokenPayload = { id: user.id, tenantId: user.tenantId, role: user.role, branchId: user.branchId };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

  const { password: _, ...userResponse } = user;
  return { token, user: userResponse, tenant };
};