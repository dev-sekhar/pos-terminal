import { Request, Response, NextFunction } from 'express';
import * as purchasesService from '../services/purchasesService';
import { UserContextPayload } from '../types/custom';
import { Role } from '@prisma/client';

const getUserFromRequest = (req: Request): UserContextPayload => {
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

export const listPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const purchases = await purchasesService.listPurchases(requestingUser);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const purchase = await purchasesService.createPurchase(req.body, requestingUser);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const purchase = await purchasesService.getPurchaseById(Number(req.params.id), requestingUser);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const updatePurchase = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: 'Updating purchases is not implemented yet.' });
};

export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const result = await purchasesService.deletePurchase(Number(req.params.id), requestingUser);
    if (result.count === 0) return res.status(404).json({ message: 'Purchase not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewPONumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestingUser = getUserFromRequest(req);
        const poNumber = await purchasesService.generateNewPONumber(requestingUser);
        res.json({ poNumber });
    } catch(err) {
        next(err);
    }
};