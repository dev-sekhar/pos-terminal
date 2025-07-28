import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categoriesService';
import { User, Role } from '@prisma/client';

// The return type is a plain object that matches what the function actually returns.
const getUserFromRequest = (req: Request): { id: number; tenantId: string; role: Role; branchId: number; } => {
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

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    // We cast it to User here because the service layer expects the full model,
    // but our service logic only uses the properties we are passing. This is a safe cast.
    const categories = await categoriesService.listCategories(requestingUser as User);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    const category = await categoriesService.createCategory({ name, description }, requestingUser as User);
    res.status(201).json(category);
  } catch (err) { next(err); }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const category = await categoriesService.getCategoryById(Number(req.params.id), requestingUser as User);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const category = await categoriesService.updateCategory(Number(req.params.id), req.body, requestingUser as User);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    await categoriesService.deleteCategory(Number(req.params.id), requestingUser as User);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};