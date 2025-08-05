import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as dashboardService from '../services/dashboardService';
// We no longer need prisma in the controller.

/**
 * Creates the UserContextPayload object that the service layer expects.
 * It combines the user info from the JWT (via authMiddleware) with the
 * tenant's DATABASE ID (via tenantMiddleware).
 * @param req The authenticated request object.
 * @returns The context payload for the service layer.
 */
const createServiceContext = (req: AuthenticatedRequest) => {
  return {
    ...req.user,
    // This is the critical fix: use the tenant's database ID, not the subdomain.
    tenantId: req.tenant.id,
  };
};


// --- Controller Function ---

export const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    // The dashboard service will use the user's role and branchId from the context to return the correct data
    const metrics = await dashboardService.getDashboardMetrics(context);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
};