import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settingsService';
import { UserContextPayload } from '../types/custom';
import { Role } from '@prisma/client';

// This is the correct, safe, and synchronous helper function.
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

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    // This call is now fully type-safe.
    const settings = await settingsService.getSettings(requestingUser);
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const newSettings = req.body;
    // This call is now fully type-safe.
    const updatedSettings = await settingsService.updateSettings(requestingUser, newSettings);
    res.json(updatedSettings);
  } catch (err) {
    next(err);
  }
};