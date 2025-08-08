import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as tenantsService from '../services/tenantsService';

const createServiceContext = (req: AuthenticatedRequest) => {
  return {
    ...req.user,
    tenantId: req.tenant.id,
  };
};

export const listTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const tenants = await tenantsService.listTenants(context);
    res.json(tenants);
  } catch (err) { 
    next(err); 
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const tenant = await tenantsService.createTenant(req.body, context);
    res.status(201).json(tenant);
  } catch (err) { 
    next(err); 
  }
};

export const getTenantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const tenant = await tenantsService.getTenantById(req.params.id, context);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found or access denied.' });
    res.json(tenant);
  } catch (err) { 
    next(err); 
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const tenant = await tenantsService.updateTenant(req.params.id, req.body, context);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found or access denied.' });
    res.json(tenant);
  } catch (err) { 
    next(err); 
  }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    await tenantsService.deleteTenant(req.params.id, context);
    res.status(204).send();
  } catch (err) { 
    next(err); 
  }
};

// --- THIS IS THE NEW FUNCTION ---
export const getPublicInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const publicInfo = await tenantsService.getPublicTenantInfo(context);
    res.json(publicInfo);
  } catch (err) { 
    next(err); 
  }
};