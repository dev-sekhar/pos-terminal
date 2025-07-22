import { Request, Response, NextFunction } from 'express';
import * as salesService from '../services/salesService';

export const listSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const sales = await salesService.listSales(tenantId);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const createdById = req.body.createdById;
    const sale = await salesService.createSale(req.body, tenantId, createdById);
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const sale = await salesService.getSaleById(Number(req.params.id), tenantId);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const sale = await salesService.updateSale(Number(req.params.id), req.body, tenantId);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const sale = await salesService.deleteSale(Number(req.params.id), tenantId);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    next(err);
  }
}; 