import { Prisma } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma';

// This function correctly fetches the settings for the logged-in user's tenant.
export const getSettings = async (requestingUser: UserContextPayload) => {
  const { tenantId } = requestingUser;
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  return tenant.settings;
};

// This function now correctly merges new settings with existing ones.
export const updateSettings = async (requestingUser: UserContextPayload, data: any) => {
  const { tenantId } = requestingUser;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  // Merge the new settings with any existing settings.
  // This prevents updating the timezone from deleting the currency, for example.
  const currentSettings = (tenant.settings as Prisma.JsonObject) || {};
  const newSettings = { ...currentSettings, ...data };

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: newSettings,
    },
  });

  return updatedTenant.settings;
};