import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as reportsService from '../services/reportsService';

/**
 * Creates the UserContextPayload object that the service layer expects.
 */
const createServiceContext = (req: AuthenticatedRequest) => {
  return {
    ...req.user,
    tenantId: req.tenant.id,
  };
};

// --- Controller Function ---
export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const reportData = await reportsService.generateReports(context);
    res.json(reportData);
  } catch (err) {
    next(err);
  }
};