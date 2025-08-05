import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as inventoryService from '../services/inventoryService';

const createServiceContext = (req: AuthenticatedRequest) => {
  return { ...req.user, tenantId: req.tenant.id };
};

export const listInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const inventory = await inventoryService.listInventory(context);
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const inventory = await inventoryService.createInventory(req.body, context);
    res.status(201).json(inventory);
  } catch (err) {
    next(err);
  }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // --- THIS IS THE FIX ---
    // 1. Parse the ID from the request parameters.
    const id = parseInt(req.params.id, 10);

    // 2. Add a validation check. If the ID is not a valid number, it's a bad request.
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid inventory ID provided.' });
    }

    // 3. The rest of the function can now proceed, knowing `id` is a valid number.
    const context = createServiceContext(req as AuthenticatedRequest);
    const inventory = await inventoryService.getInventoryById(id, context);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid inventory ID provided.' });
    }
    const context = createServiceContext(req as AuthenticatedRequest);
    const inventory = await inventoryService.updateInventory(id, req.body, context);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid inventory ID provided.' });
    }
    const context = createServiceContext(req as AuthenticatedRequest);
    const result = await inventoryService.deleteInventory(id, context);
    if (result.count === 0) return res.status(404).json({ message: 'Inventory record not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const listInventoryForSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const inventory = await inventoryService.listInventoryForSales(context);
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};