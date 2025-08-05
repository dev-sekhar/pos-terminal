import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as salesService from '../services/salesService';

const createServiceContext = (req: AuthenticatedRequest) => {
  return { ...req.user, tenantId: req.tenant.id };
};

export const listSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const sales = await salesService.listSales(context);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const sale = await salesService.createSale(req.body, context);
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const sale = await salesService.getSaleById(Number(req.params.id), context);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "Updating sales is not implemented." });
};

// --- THIS IS THE CORRECTED DELETE FUNCTION FOR THE CONTROLLER ---
export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const result = await salesService.deleteSale(Number(req.params.id), context);

    if (!result) {
      return res.status(404).json({ message: 'Sale not found or permission denied' });
    }
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewInvoiceNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const context = createServiceContext(req as AuthenticatedRequest);
        const invoice = await salesService.generateNewInvoiceNumber(context);
        res.json({ invoice });
    } catch (err) {
        next(err);
    }
};