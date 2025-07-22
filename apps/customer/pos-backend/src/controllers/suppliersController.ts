import { Request, Response, NextFunction } from 'express';
import * as suppliersService from '../services/suppliersService';

export const listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const suppliers = await suppliersService.listSuppliers(tenantId);
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const createdById = req.body.createdById;
    const supplier = await suppliersService.createSupplier(req.body, tenantId, createdById);
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

export const getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const supplier = await suppliersService.getSupplierById(Number(req.params.id), tenantId);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const supplier = await suppliersService.updateSupplier(Number(req.params.id), req.body, tenantId);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const supplier = await suppliersService.deleteSupplier(Number(req.params.id), tenantId);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
}; 