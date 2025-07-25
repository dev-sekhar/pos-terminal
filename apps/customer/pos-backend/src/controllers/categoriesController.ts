import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categoriesService';

// Securely gets the tenantId from the request object (attached by middleware)
const getTenantId = (req: Request): string => {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new Error('Tenant ID is missing from the request session.');
    return tenantId;
};

// Securely gets the userId from the request object
const getUserId = (req: Request): number => {
    const userId = req.user?.id;
    if (!userId) throw new Error('User ID is missing from the request session.');
    return Number(userId); // Ensure it's a number
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const categories = await categoriesService.listCategories(tenantId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const { name, description } = req.body;
    
    const category = await categoriesService.createCategory(
      { name, description, createdById },
      tenantId
    );
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const category = await categoriesService.getCategoryById(Number(req.params.id), tenantId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const category = await categoriesService.updateCategory(Number(req.params.id), req.body, tenantId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await categoriesService.deleteCategory(Number(req.params.id), tenantId);
    res.status(204).send(); // 204 No Content is standard for a successful delete
  } catch (err) {
    next(err);
  }
};