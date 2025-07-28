import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';
import { UserContextPayload } from '../types/custom';
import { Role } from '@prisma/client';

// This is the correct, safe helper function.
const getUserFromRequest = (req: Request): UserContextPayload => {
    const user = req.user;
    if (!user) {
        throw new Error('User context is missing from the request session.');
    }
    return {
        id: Number(user.id),
        tenantId: user.tenantId,
        role: user.role,
        branchId: user.branchId,
    };
};

export const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    // This call is now fully type-safe and does not use any unsafe casting.
    const metrics = await dashboardService.getDashboardMetrics(requestingUser);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
};