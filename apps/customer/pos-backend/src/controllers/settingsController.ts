import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settingsService';
const getTenantId = (req: Request): string => req.tenant!.id;
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
try {
const tenantId = getTenantId(req);
const settings = await settingsService.getSettings(tenantId);
res.json(settings);
} catch (err) {
next(err);
}
};
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
try {
const tenantId = getTenantId(req);
// Add validation here in a real app (e.g., using Zod)
const newSettings = req.body;
const updatedSettings = await settingsService.updateSettings(tenantId, newSettings);
res.json(updatedSettings);
} catch (err) {
next(err);
}
};