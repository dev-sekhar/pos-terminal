import { PrismaClient } from '@prisma/client';
import { UserContextPayload } from '../types/custom'; // 1. IMPORT THE PAYLOAD TYPE

export type TenantSettings = { currency: string; units: string[]; paymentTypes: string[]; };
const defaultSettings: TenantSettings = { currency: 'USD', units: ['kg', 'L', 'pcs'], paymentTypes: ['Cash', 'Card', 'UPI'] };

const prisma = new PrismaClient();

// 2. UPDATE THE FUNCTION SIGNATURE
export const getSettings = async (requestingUser: UserContextPayload): Promise<TenantSettings> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: requestingUser.tenantId },
    select: { settings: true },
  });
  const savedSettings = tenant?.settings as Partial<TenantSettings> || {};
  return { ...defaultSettings, ...savedSettings };
};

export const updateSettings = async (requestingUser: UserContextPayload, newSettings: TenantSettings): Promise<TenantSettings> => {
  await prisma.tenant.update({
    where: { id: requestingUser.tenantId },
    data: { settings: newSettings },
  });
  return newSettings;
};