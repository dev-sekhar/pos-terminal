import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as purchasesService from '../services/purchasesService';
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

export const listPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const purchases = await purchasesService.listPurchases(context);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const purchase = await purchasesService.createPurchase(req.body, context);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const purchase = await purchasesService.getPurchaseById(Number(req.params.id), context);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const updatePurchase = async (req: Request, res: Response, next: NextFunction) => {
    // Preserving the original logic
    res.status(501).json({ message: 'Updating purchases is not implemented yet.' });
};

export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const result = await purchasesService.deletePurchase(Number(req.params.id), context);
    if (result.count === 0) return res.status(404).json({ message: 'Purchase not found or permission denied' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewPONumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const context = createServiceContext(req as AuthenticatedRequest);
        const poNumber = await purchasesService.generateNewPONumber(context);
        res.json({ poNumber });
    } catch(err) {
        next(err);
    }
};