import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventoryService';
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

export const listInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const inventory = await inventoryService.listInventory(requestingUser);
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const inventory = await inventoryService.createInventory(req.body, requestingUser);
    res.status(201).json(inventory);
  } catch (err) {
    next(err);
  }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const inventory = await inventoryService.getInventoryById(Number(req.params.id), requestingUser);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const inventory = await inventoryService.updateInventory(Number(req.params.id), req.body, requestingUser);
    if (!inventory) return res.status(404).json({ message: 'Inventory record not found' });
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const result = await inventoryService.deleteInventory(Number(req.params.id), requestingUser);
    if (result.count === 0) return res.status(404).json({ message: 'Inventory record not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};