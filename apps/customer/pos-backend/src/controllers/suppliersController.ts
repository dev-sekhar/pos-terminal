import { Request, Response, NextFunction } from 'express';
import * as suppliersService from '../services/suppliersService';

const getTenantId = (req: Request): string => {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new Error('Tenant ID is missing from the request session.');
    return tenantId;
};

const getUserId = (req: Request): number => {
    const userId = req.user?.id;
    if (!userId) throw new Error('User ID is missing from the request session.');
    return Number(userId);
};

// Corrected function name to match the router
export const listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    // Calls the correct service function
    const suppliers = await suppliersService.listSuppliersForTenant(tenantId);
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

// Corrected function name to match the router
export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    // Calls the correct "smart" service function
    const supplier = await suppliersService.createOrLinkSupplier(req.body, tenantId, createdById);
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

// Corrected function name to match the router
export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const supplierId = Number(req.params.id);
    // Calls the correct service function to "unlink"
    await suppliersService.unlinkSupplierFromTenant(supplierId, tenantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};