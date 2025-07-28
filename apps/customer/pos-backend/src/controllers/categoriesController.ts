import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categoriesService';
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

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const categories = await categoriesService.listCategories(requestingUser);
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

    const category = await categoriesService.createCategory({ name, description }, requestingUser);
    res.status(201).json(category);
  } catch (err) { next(err); }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const category = await categoriesService.getCategoryById(Number(req.params.id), requestingUser);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const category = await categoriesService.updateCategory(Number(req.params.id), req.body, requestingUser);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    await categoriesService.deleteCategory(Number(req.params.id), requestingUser);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};