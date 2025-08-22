import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/pricing/limits - Get current tenant's plan limits
router.get('/limits', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ message: 'Tenant not found' });
    }
    
    const { PricingPlanEnforcer } = await import('../services/planLimitService');
    const limits = await PricingPlanEnforcer.getPlanLimits(tenantId);
    res.json(limits);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plan limits' });
  }
});

export default router;