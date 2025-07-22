import { Request, Response, NextFunction } from 'express';
import * as registerTenantService from '../services/registerTenantService';

export const registerTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant, user } = req.body;
    const result = await registerTenantService.registerTenantAndUser(tenant, user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}; 