import { PrismaClient, Tenant } from '@prisma/client';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

export const listTenants = async (requestingUser: UserContextPayload): Promise<Tenant[]> => {
  return prisma.tenant.findMany({ 
    where: { id: requestingUser.tenantId } 
  });
};

export const getTenantById = async (id: string, requestingUser: UserContextPayload): Promise<Tenant | null> => {
    if (id !== requestingUser.tenantId) return null;
    return prisma.tenant.findUnique({ where: { id } });
};

export const createTenant = async (data: any, requestingUser: UserContextPayload): Promise<Tenant> => {
    return prisma.tenant.create({ data });
};

export const updateTenant = async (id: string, data: any, requestingUser: UserContextPayload): Promise<Tenant | null> => {
    if (id !== requestingUser.tenantId) throw new Error("Forbidden");
    await prisma.tenant.update({ where: { id }, data });
    return getTenantById(id, requestingUser);
};

export const deleteTenant = async (id: string, requestingUser: UserContextPayload): Promise<void> => {
    if (id !== requestingUser.tenantId) throw new Error("Forbidden");
    await prisma.tenant.update({ where: { id }, data: { deleted: true } });
};