import { Request, Response, NextFunction } from 'express';
import * as purchasesService from '../services/purchasesService';

const getTenantId = (req: Request): string => req.tenant!.id;
const getUserId = (req: Request): number => Number(req.user!.id);

export const listPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const purchases = await purchasesService.listPurchases(tenantId);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const purchase = await purchasesService.createPurchase(req.body, tenantId, createdById);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const purchase = await purchasesService.getPurchaseById(Number(req.params.id), tenantId);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

// Note: Updating a purchase with items is complex and often handled by deleting/recreating.
// This is a placeholder for a more complex implementation if needed.
export const updatePurchase = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: 'Updating purchases is not implemented yet.' });
};

export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const result = await purchasesService.deletePurchase(Number(req.params.id), tenantId);
    if (result.count === 0) return res.status(404).json({ message: 'Purchase not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewPONumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getTenantId(req);
        const poNumber = await purchasesService.generateNewPONumber(tenantId);
        res.json({ poNumber });
    } catch(err) {
        next(err);
    }
};