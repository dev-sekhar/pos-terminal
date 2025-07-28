import { Request, Response, NextFunction } from 'express';
import * as salesService from '../services/salesService';
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
export const listSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const sales = await salesService.listSales(requestingUser);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const sale = await salesService.createSale(req.body, requestingUser);
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const sale = await salesService.getSaleById(Number(req.params.id), requestingUser);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "Updating sales is not implemented." });
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const result = await salesService.deleteSale(Number(req.params.id), requestingUser);
    if (result.count === 0) return res.status(404).json({ message: 'Sale not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewInvoiceNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestingUser = getUserFromRequest(req);
        const invoice = await salesService.generateNewInvoiceNumber(requestingUser);
        res.json({ invoice });
    } catch (err) {
        next(err);
    }
};