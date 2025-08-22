// CHANGE 1: Import the 'Prisma' type utility from '@prisma/client'
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const registerTenant = async (tenantData: any, userData: any) => {
  // CHANGE 2: Add the type 'Prisma.TransactionClient' to the 'tx' parameter
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Get the Free plan
    const freePlan = await tx.pricingPlan.findFirst({
      where: { name: 'Free', active: true }
    });

    const tenant = await tx.tenant.create({ 
      data: { 
        name: tenantData.name, 
        subdomain: tenantData.subdomain,
        pricingPlanId: freePlan?.id
      } 
    });

    const mainBranch = await tx.branch.create({
      data: {
        name: 'Main',
        tag: 'Main',
        tenantId: tenant.id,
      }
    });

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await tx.user.create({ 
      data: { 
        name: userData.name,
        email: userData.email,
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
  });
};