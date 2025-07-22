import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const registerTenantAndUser = async (tenantData: any, userData: any) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Create tenant
    const tenant = await tx.tenant.create({
      data: {
        ...tenantData,
        deleted: false,
      },
    });

    // 2. Create default branch
    const branch = await tx.branch.create({
      data: {
        tenantId: tenant.id,
        name: 'Main',
        tag: 'main',
        active: true,
        deleted: false,
       // createdById: null, // explicitly set to null for the first branch
      },
    });

    // 3. Create master user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await tx.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        tenantId: tenant.id,
        role: 'ADMIN',
        createdById: null,
        branchId: branch.id,
      },
    });

    // 4. Generate JWT
    const token = jwt.sign({ userId: user.id, tenantId: tenant.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return { tenant, branch, user, token };
  });
}; 