import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/usersService';

const getTenantId = (req: Request): string => {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new Error('Tenant ID is missing from the request session.');
    return tenantId;
};

const getUserId = (req: Request): number => {
    const userId = req.user?.id;
    if (!userId) throw new Error('User ID is missing from the request session.');
    return Number(userId);
};

// The 'export' keyword is crucial here
export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const users = await usersService.listUsers(tenantId);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// The 'export' keyword is crucial here
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const user = await usersService.createUser(req.body, tenantId, createdById);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// The 'export' keyword is crucial here
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const user = await usersService.getUserById(Number(req.params.id), tenantId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// The 'export' keyword is crucial here
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const user = await usersService.updateUser(Number(req.params.id), req.body, tenantId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// The 'export' keyword is crucial here
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await usersService.deleteUser(Number(req.params.id), tenantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};