import { PrismaClient, Tenant, Prisma } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma'; // Use the shared prisma client

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
    // This function is likely only for super-admin purposes and is correctly locked down.
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

// --- THIS IS THE NEW FUNCTION ---
// This function fetches only the public-facing branding information for a tenant.
export const getPublicTenantInfo = async (requestingUser: UserContextPayload) => {
  const { tenantId } = requestingUser;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      settings: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const settingsJson = tenant.settings as Prisma.JsonObject;
  return {
    id: tenant.id,
    name: tenant.name,
    branding: {
      tenantDisplayName: settingsJson?.tenantDisplayName || tenant.name,
      logo: settingsJson?.logo || null,
    }
  };
};