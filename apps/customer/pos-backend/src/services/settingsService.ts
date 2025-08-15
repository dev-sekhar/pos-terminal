import { Prisma, User } from '@prisma/client'; // Import the full User type
import prisma from '../lib/prisma';

// Define a type for our settings object for better type safety
type TenantSettings = Prisma.JsonObject;

/**
 * Fetches the settings for the tenant associated with the requesting user.
 * @param requestingUser The full User object from the database.
 * @returns The tenant's settings object.
 */
export const getSettings = async (requestingUser: User): Promise<TenantSettings> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: requestingUser.tenantId },
    select: { settings: true },
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  return (tenant.settings as TenantSettings) || {};
};

/**
 * Updates the tenant's settings and creates an audit log entry in a single transaction.
 * @param requestingUser The full User object performing the update.
 * @param newSettingsData The new settings data to merge and save.
 * @returns The updated settings object.
 */
export const updateSettings = async (requestingUser: User, newSettingsData: Partial<TenantSettings>): Promise<TenantSettings> => {
  return prisma.$transaction(async (tx) => {
    // 1. Get the current tenant to retrieve old settings for the audit trail
    const tenant = await tx.tenant.findUnique({ where: { id: requestingUser.tenantId } });
    if (!tenant) {
      throw new Error("Tenant not found.");
    }

    const oldSettings = (tenant.settings as TenantSettings) || {};
    // Merge new settings with old ones to ensure no data is lost
    const newSettings = { ...oldSettings, ...newSettingsData };
    
    // 2. Create the audit log record
    await tx.auditLog.create({
      data: {
        tenantId: requestingUser.tenantId,
        userId: requestingUser.id,
        action: 'TENANT_SETTINGS_UPDATED',
        details: {
          oldValue: oldSettings,
          newValue: newSettings,
          changedBy: { id: requestingUser.id, email: requestingUser.email },
        },
      },
    });

    // 3. Update the tenant with the fully merged new settings
    const updatedTenant = await tx.tenant.update({
      where: { id: requestingUser.tenantId },
      data: {
        settings: newSettings,
      },
    });

    return updatedTenant.settings as TenantSettings;
  });
};