import { PrismaClient, Tenant } from '@prisma/client';
const prisma = new PrismaClient();

export const listTenants = async (): Promise<Tenant[]> => {
  return prisma.tenant.findMany({ where: { deleted: false }, orderBy: { name: 'asc' } });
};

export const createTenant = async (data: any): Promise<Tenant> => {
  return prisma.tenant.create({
    data: {
      ...data,
      deleted: false,
    },
  });
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  return prisma.tenant.findFirst({ where: { id, deleted: false } });
};

export const updateTenant = async (id: string, data: any): Promise<Tenant | null> => {
  try {
    return await prisma.tenant.update({ where: { id }, data });
  } catch {
    return null;
  }
};

export const deleteTenant = async (id: string): Promise<Tenant | null> => {
  try {
    return await prisma.tenant.update({ where: { id }, data: { deleted: true } });
  } catch {
    return null;
  }
}; 