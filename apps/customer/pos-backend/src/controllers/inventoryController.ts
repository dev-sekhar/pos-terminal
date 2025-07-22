import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventoryService';

export const listInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const inventory = await inventoryService.listInventory(tenantId);
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const createdById = req.body.createdById;
    const inventory = await inventoryService.createInventory(req.body, tenantId, createdById);
    res.status(201).json(inventory);
  } catch (err) {
    next(err);
  }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const inventory = await inventoryService.getInventoryById(Number(req.params.id), tenantId);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const inventory = await inventoryService.updateInventory(Number(req.params.id), req.body, tenantId);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const inventory = await inventoryService.deleteInventory(Number(req.params.id), tenantId);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json({ message: 'Inventory record deleted' });
  } catch (err) {
    next(err);
  }
}; 