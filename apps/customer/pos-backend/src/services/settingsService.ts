import { Prisma, User } from '@prisma/client'; // Import the full User type
import prisma from '../lib/prisma';

// Define a type for our settings object for better type safety
type TenantSettings = Prisma.JsonObject;

/**
 * Fetches the settings for the tenant associated with the requesting user.
 * @param requestingUser The full User object from the database.
 * @returns The tenant's settings object.
 */
export const getSettings = async (requestingUser: User): Promise<TenantSettings & { pricingPlanId?: number }> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: requestingUser.tenantId },
    select: { settings: true, pricingPlanId: true },
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const defaultSettings = {
    currency: 'USD',
    timezone: 'UTC',
    units: ['pcs', 'kg', 'ltr', 'box', 'pack'],
    paymentTypes: ['Cash', 'Card', 'UPI', 'Bank Transfer'],
    tenantDisplayName: '',
    financialYearStart: 'April',
    dashboardWidgets: {
      totalToday: true,
      mtdChart: true,
      fytdChart: true,
      topToday: true,
      topMonth: true,
      topYear: true
    }
  };

  const dbSettings = (tenant.settings as TenantSettings) || {};
  const dbWidgets = dbSettings.dashboardWidgets as Record<string, boolean> || {};
  
  // Only initialize if dashboardWidgets is completely empty
  const shouldInitialize = !dbWidgets || Object.keys(dbWidgets).length === 0;
  
  if (shouldInitialize) {
    const initializedSettings = {
      ...defaultSettings,
      ...dbSettings,
      dashboardWidgets: defaultSettings.dashboardWidgets
    };
    
    // Save initialized settings to database
    await prisma.tenant.update({
      where: { id: requestingUser.tenantId },
      data: { settings: initializedSettings }
    });
    
    return {
      ...initializedSettings,
      pricingPlanId: tenant.pricingPlanId ?? undefined
    };
  }
  
  // If dashboardWidgets exist, use them as-is without merging defaults
  return {
    ...defaultSettings,
    ...dbSettings,
    pricingPlanId: tenant.pricingPlanId ?? undefined
  };
};

/**
 * Updates the tenant's settings and creates an audit log entry in a single transaction.
 * @param requestingUser The full User object performing the update.
 * @param newSettingsData The new settings data to merge and save.
 * @returns The updated settings object.
 */
export const updateSettings = async (requestingUser: User, newSettingsData: Partial<TenantSettings & { pricingPlanId?: number }>): Promise<TenantSettings & { pricingPlanId?: number }> => {
  console.log('Settings Service - Received data:', JSON.stringify(newSettingsData, null, 2));
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Get the current tenant to retrieve old settings for the audit trail
      const tenant = await tx.tenant.findUnique({ where: { id: requestingUser.tenantId } });
      if (!tenant) {
        throw new Error("Tenant not found.");
      }

      const oldSettings = (tenant.settings as TenantSettings) || {};
      
      // Proper merge with special handling for dashboardWidgets
      const oldWidgets = (oldSettings.dashboardWidgets as Record<string, boolean>) || {};
      const newWidgets = (newSettingsData.dashboardWidgets as Record<string, boolean>) || {};
      
      console.log('=== UPDATE SETTINGS DEBUG ===');
      // Exclude logo to prevent log truncation
      const oldSettingsNoLogo = { ...oldSettings };
      if ('logo' in oldSettingsNoLogo) {
        delete (oldSettingsNoLogo as any).logo;
      }
      const newDataNoLogo = { ...newSettingsData };
      if ('logo' in newDataNoLogo) {
        delete (newDataNoLogo as any).logo;
      }
      
      console.log('Old settings from DB:', JSON.stringify(oldSettingsNoLogo, null, 2));
      console.log('New data from frontend:', JSON.stringify(newDataNoLogo, null, 2));
      console.log('Old widgets:', JSON.stringify(oldWidgets, null, 2));
      console.log('New widgets:', JSON.stringify(newWidgets, null, 2));
      
      const mergedWidgets = { ...oldWidgets, ...newWidgets };
      console.log('Merged widgets result:', JSON.stringify(mergedWidgets, null, 2));
      
      const newSettings = {
        ...oldSettings,
        ...newSettingsData,
        dashboardWidgets: mergedWidgets
      };
      
      const finalSettingsNoLogo = { ...newSettings };
      if ('logo' in finalSettingsNoLogo) {
        delete (finalSettingsNoLogo as any).logo;
      }
      console.log('Final settings to save to DB:', JSON.stringify(finalSettingsNoLogo, null, 2));
      
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

      // 3. Update the tenant with the fully merged new settings and pricingPlanId
      const updateData: any = { settings: newSettings };
      if ('pricingPlanId' in newSettingsData) {
        // If no current plan or same plan, update immediately
        if (!tenant.pricingPlanId || tenant.pricingPlanId === newSettingsData.pricingPlanId) {
          updateData.pricingPlanId = newSettingsData.pricingPlanId;
          if (!tenant.currentPlanStartDate) {
            updateData.currentPlanStartDate = new Date();
          }
        } else {
          // If changing to a different plan, schedule for next billing period
          updateData.nextPlanId = newSettingsData.pricingPlanId;
          
          // Calculate next billing period start date
          if (tenant.currentPlanStartDate) {
            const startDate = new Date(tenant.currentPlanStartDate);
            const now = new Date();
            const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
            
            const nextPeriodStart = new Date(startDate);
            nextPeriodStart.setMonth(startDate.getMonth() + monthsDiff + 1);
            
            const currentPeriodEnd = new Date(nextPeriodStart);
            currentPeriodEnd.setDate(currentPeriodEnd.getDate() - 1);
            
            updateData.nextPlanActivationDate = nextPeriodStart;
            updateData.currentPlanEndDate = currentPeriodEnd;
          }
        }
      }
      
      const updatedTenant = await tx.tenant.update({
        where: { id: requestingUser.tenantId },
        data: updateData,
      });
      
      const dbResultNoLogo = { ...updatedTenant.settings as any };
      if ('logo' in dbResultNoLogo) {
        delete dbResultNoLogo.logo;
      }
      console.log('DB UPDATE RESULT:', JSON.stringify(dbResultNoLogo, null, 2));
      console.log('DB dashboardWidgets saved:', JSON.stringify((updatedTenant.settings as any)?.dashboardWidgets, null, 2));
      console.log('Updated tenant nextPlanId:', updatedTenant.nextPlanId);
      console.log('Updated tenant nextPlanActivationDate:', updatedTenant.nextPlanActivationDate);
      console.log('=== END UPDATE SETTINGS DEBUG ===');
      
      // Return the merged settings we just saved, not what's in the database
      return {
        ...newSettings,
        pricingPlanId: updatedTenant.pricingPlanId ?? undefined
      };
    });
  } catch (error) {
    console.error('Settings update error:', error);
    throw new Error(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};