import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Define a type for our settings object for safety
export type TenantSettings = {
  currency: string;
  units: string[];
  paymentTypes: string[];
};

// Default settings for a new tenant
const defaultSettings: TenantSettings = {
  currency: 'USD',
  units: ['kg', 'L', 'pcs'],
  paymentTypes: ['Cash', 'Card', 'UPI'],
};

// Get the settings for a tenant, returning defaults if none are set
export const getSettings = async (tenantId: string): Promise<TenantSettings> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  // Merge the saved settings over the defaults to ensure all keys are present
  const savedSettings = tenant?.settings as Partial<TenantSettings> || {};
  return { ...defaultSettings, ...savedSettings };
};

// Update the settings for a tenant
export const updateSettings = async (tenantId: string, newSettings: TenantSettings): Promise<TenantSettings> => {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { settings: newSettings },
  });
  return newSettings;
};