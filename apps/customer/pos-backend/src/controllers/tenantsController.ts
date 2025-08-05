import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as tenantsService from '../services/tenantsService';
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

export const listTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    // The service layer should correctly filter to only show the user's own tenant.
    const tenants = await tenantsService.listTenants(context);
    res.json(tenants);
  } catch (err) { 
    next(err); 
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    // Note: This endpoint is likely redundant with the public /register-tenant route
    // but we are fixing it for completeness.
    const tenant = await tenantsService.createTenant(req.body, context);
    res.status(201).json(tenant);
  } catch (err) { 
    next(err); 
  }
};

export const getTenantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    // The service layer must validate that the requested ID matches the user's tenant.
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
    // The service layer must validate that the requested ID matches the user's tenant.
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
    // The service layer must validate that the requested ID matches the user's tenant.
    await tenantsService.deleteTenant(req.params.id, context);
    res.status(204).send();
  } catch (err) { 
    next(err); 
  }
};