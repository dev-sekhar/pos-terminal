import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ResourceType = 'users' | 'branches' | 'products';

interface PlanLimitResult {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number | 'unlimited';
  planName: string;
}

export class PricingPlanEnforcer {
  static async checkLimit(tenantId: string, resourceType: ResourceType): Promise<PlanLimitResult> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { pricingPlan: true }
    });

    if (!tenant?.pricingPlan) {
      return { allowed: true, currentCount: 0, maxAllowed: 'unlimited', planName: 'No Plan' };
    }

    const plan = tenant.pricingPlan;
    let currentCount = 0;
    const planField = `max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`;
    const limitValue = plan[planField as keyof typeof plan] as string;

    // Count current resources
    switch (resourceType) {
      case 'users':
        currentCount = await prisma.user.count({ where: { tenantId, deleted: false } });
        break;
      case 'branches':
        currentCount = await prisma.branch.count({ where: { tenantId, deleted: false } });
        break;
      case 'products':
        currentCount = await prisma.product.count({ where: { tenantId, deleted: false } });
        break;
    }

    // Check if unlimited
    if (limitValue.toLowerCase().includes('unlimited')) {
      return { allowed: true, currentCount, maxAllowed: 'unlimited', planName: plan.name };
    }

    const maxAllowed = parseInt(limitValue) || 0;
    const allowed = currentCount < maxAllowed;

    return { allowed, currentCount, maxAllowed, planName: plan.name };
  }

  static async enforceLimit(tenantId: string, resourceType: ResourceType): Promise<void> {
    const result = await this.checkLimit(tenantId, resourceType);
    
    if (!result.allowed) {
      throw new Error(
        `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} limit exceeded. ` +
        `Current: ${result.currentCount}, Max allowed: ${result.maxAllowed} (${result.planName} plan)`
      );
    }
  }

  static async getPlanLimits(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { pricingPlan: true }
    });

    if (!tenant?.pricingPlan) return null;

    const [userResult, branchResult, productResult] = await Promise.all([
      this.checkLimit(tenantId, 'users'),
      this.checkLimit(tenantId, 'branches'),
      this.checkLimit(tenantId, 'products')
    ]);

    return {
      planName: tenant.pricingPlan.name,
      users: userResult,
      branches: branchResult,
      products: productResult,
      features: tenant.pricingPlan.features as string[] || []
    };
  }
}

// Legacy function for backward compatibility
export const checkPlanLimits = (tenantId: string, resourceType: ResourceType) => 
  PricingPlanEnforcer.checkLimit(tenantId, resourceType).then(result => result.allowed);