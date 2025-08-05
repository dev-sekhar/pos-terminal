import { Request, Response, NextFunction } from 'express';
import * as registerTenantService from '../services/registerTenantService';

export const registerTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant, user } = req.body;
    if (!tenant || !user || !tenant.name || !tenant.subdomain || !user.name || !user.email || !user.password) {
      return res.status(400).json({ message: 'Missing required tenant or user information for registration.' });
    }
    const result = await registerTenantService.registerTenant(tenant, user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};