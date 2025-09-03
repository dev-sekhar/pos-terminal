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
    let limitValue: number | null;

    // Count current resources and get limit
    switch (resourceType) {
      case 'users':
        currentCount = await prisma.user.count({ where: { tenantId, deleted: false } });
        limitValue = plan.maxUsers;
        break;
      case 'branches':
        currentCount = await prisma.branch.count({ where: { tenantId, deleted: false } });
        limitValue = plan.maxBranches;
        break;
      case 'products':
        currentCount = await prisma.product.count({ where: { tenantId, deleted: false } });
        limitValue = plan.maxProducts;
        break;
    }

    // Check if unlimited (null value)
    if (limitValue === null) {
      return { allowed: true, currentCount, maxAllowed: 'unlimited', planName: plan.name };
    }

    const allowed = currentCount < limitValue;
    return { allowed, currentCount, maxAllowed: limitValue, planName: plan.name };
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