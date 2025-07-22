import { Request, Response, NextFunction } from 'express';
import * as purchasesService from '../services/purchasesService';

export const listPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const purchases = await purchasesService.listPurchases(tenantId);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const createdById = req.body.createdById;
    const purchase = await purchasesService.createPurchase(req.body, tenantId, createdById);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const purchase = await purchasesService.getPurchaseById(Number(req.params.id), tenantId);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const updatePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const purchase = await purchasesService.updatePurchase(Number(req.params.id), req.body, tenantId);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const purchase = await purchasesService.deletePurchase(Number(req.params.id), tenantId);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json({ message: 'Purchase deleted' });
  } catch (err) {
    next(err);
  }
}; 