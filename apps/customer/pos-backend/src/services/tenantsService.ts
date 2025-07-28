import { PrismaClient, Tenant } from '@prisma/client';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

// In this context, a user can only list their own tenant.
export const listTenants = async (requestingUser: UserContextPayload): Promise<Tenant[]> => {
  return prisma.tenant.findMany({ 
    where: { 
      id: requestingUser.tenantId,
      deleted: false 
    } 
  });
};

// Admins can create tenants (platform-level feature)
export const createTenant = async (data: any, requestingUser: UserContextPayload): Promise<Tenant> => {
    // Add role check here if needed in the future
    return prisma.tenant.create({ data });
};

// A user can only get their own tenant by ID.
export const getTenantById = async (id: string, requestingUser: UserContextPayload): Promise<Tenant | null> => {
  if (id !== requestingUser.tenantId) {
    // Prevent fetching other tenants' data
    return null;
  }
  return prisma.tenant.findFirst({ where: { id, deleted: false } });
};

// A user can only update their own tenant.
export const updateTenant = async (id: string, data: any, requestingUser: UserContextPayload): Promise<Tenant | null> => {
  if (id !== requestingUser.tenantId) {
    throw new Error("Forbidden: You can only update your own tenant.");
  }
  try {
    return await prisma.tenant.update({ where: { id }, data });
  } catch {
    return null;
  }
};

// Deleting is a highly privileged action.
export const deleteTenant = async (id: string, requestingUser: UserContextPayload): Promise<void> => {
  if (id !== requestingUser.tenantId) {
    throw new Error("Forbidden: You can only delete your own tenant.");
  }
  await prisma.tenant.update({ where: { id }, data: { deleted: true } });
};