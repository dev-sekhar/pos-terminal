import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as suppliersService from '../services/suppliersService';
import prisma from '../lib/prisma'; // We need prisma here for the lookup

export const listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The service only needs the string tenant ID (database CUID)
    const tenantId = (req as AuthenticatedRequest).tenant.id;
    const suppliers = await suppliersService.listSuppliersForTenant(tenantId);
    res.json(suppliers);
  } catch (err) { 
    next(err); 
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    // The service needs the tenant's database ID and the user's database ID.
    const tenantId = authReq.tenant.id; // Correct CUID string
    const createdById = authReq.user.id; // Correct number ID

    const supplier = await suppliersService.createOrLinkSupplier(req.body, tenantId, createdById);
    res.status(201).json(supplier);
  } catch (err) { 
    next(err); 
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const supplierId = Number(req.params.id);
    // The service needs the tenant's database ID.
    const tenantId = authReq.tenant.id; // Correct CUID string

    await suppliersService.unlinkSupplierFromTenant(supplierId, tenantId);
    res.status(204).send();
  } catch (err) { 
    next(err); 
  }
};