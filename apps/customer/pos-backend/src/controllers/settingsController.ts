import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as settingsService from '../services/settingsService';
import prisma from '../lib/prisma'; // Import prisma to fetch the full user

/**
 * Helper function to fetch the full user object from the database,
 * which is what the updated settingsService now requires for auditing.
 * @param req The authenticated request object.
 * @returns The full User object from the database.
 */
async function getFullUser(req: AuthenticatedRequest) {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!user) {
        throw new Error("Authenticated user not found in database.");
    }
    return user;
}


// --- Controller Functions ---

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = await getFullUser(req as AuthenticatedRequest);
    const settings = await settingsService.getSettings(requestingUser);
    res.json(settings);
  } catch (err) { 
    next(err); 
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = await getFullUser(req as AuthenticatedRequest);
    const updatedSettings = await settingsService.updateSettings(requestingUser, req.body);
    res.json(updatedSettings);
  } catch (err) { 
    next(err); 
  }
};