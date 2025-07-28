import { Request, Response, NextFunction } from 'express';
import * as suppliersService from '../services/suppliersService';
import { User, Role } from '@prisma/client';

const getUserFromRequest = (req: Request): { id: number; tenantId: string; role: Role; branchId: number; } => {
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

export const listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const suppliers = await suppliersService.listSuppliersForTenant(requestingUser.tenantId);
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const supplier = await suppliersService.createOrLinkSupplier(
      req.body,
      requestingUser.tenantId,
      requestingUser.id
    );
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const supplierId = Number(req.params.id);
    await suppliersService.unlinkSupplierFromTenant(supplierId, requestingUser.tenantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
