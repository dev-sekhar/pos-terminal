import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';

export const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // tenantId is automatically attached by our tenantMiddleware
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID is missing from request session.' });
    }

    const metrics = await dashboardService.getDashboardMetrics(tenantId);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
};