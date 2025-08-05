import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as settingsService from '../services/settingsService';
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


// --- Controller Functions ---

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const settings = await settingsService.getSettings(context);
    res.json(settings);
  } catch (err) { 
    next(err); 
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const updatedSettings = await settingsService.updateSettings(context, req.body);
    res.json(updatedSettings);
  } catch (err) { 
    next(err); 
  }
};