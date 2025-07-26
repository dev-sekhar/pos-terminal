import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventoryService';

const getTenantId = (req: Request): string => req.tenant!.id;
const getUserId = (req: Request): number => Number(req.user!.id);

export const listInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const inventory = await inventoryService.listInventory(tenantId);
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const inventory = await inventoryService.createInventory(req.body, tenantId, createdById);
    res.status(201).json(inventory);
  } catch (err) {
    next(err);
  }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const inventory = await inventoryService.getInventoryById(Number(req.params.id), tenantId);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const inventory = await inventoryService.updateInventory(Number(req.params.id), req.body, tenantId);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const result = await inventoryService.deleteInventory(Number(req.params.id), tenantId);
    if (result.count === 0) return res.status(404).json({ message: 'Inventory record not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};