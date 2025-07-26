import { Request, Response, NextFunction } from 'express';
import * as salesService from '../services/salesService';

const getTenantId = (req: Request): string => req.tenant!.id;
const getUserId = (req: Request): number => Number(req.user!.id);

export const listSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await salesService.listSales(getTenantId(req));
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sale = await salesService.createSale(req.body, getTenantId(req), getUserId(req));
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sale = await salesService.getSaleById(Number(req.params.id), getTenantId(req));
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// Updating a complex sale is often a business decision.
// A simple update is provided, but a more robust solution might involve cancelling and recreating.
export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "Updating sales is not yet implemented." });
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await salesService.deleteSale(Number(req.params.id), getTenantId(req));
    if (result.count === 0) return res.status(404).json({ message: 'Sale not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewInvoiceNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invoice = await salesService.generateNewInvoiceNumber(getTenantId(req));
        res.json({ invoice });
    } catch (err) {
        next(err);
    }
};