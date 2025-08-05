import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as categoriesService from '../services/categoriesService';
// We no longer need prisma here, as the controller's job is just to pass data.

/**
 * Creates the UserContextPayload object that the service layer expects.
 * It combines the user info from the JWT (via authMiddleware) with the
 * tenant's DATABASE ID (via tenantMiddleware).
 * @param req The authenticated request object.
 * @returns The context payload for the service layer.
 */
const createServiceContext = (req: AuthenticatedRequest) => {
  return {
    ...req.user,
    // This is the critical fix: use the tenant's database ID, not the subdomain.
    tenantId: req.tenant.id,
  };
};


// --- Controller Functions ---

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const categories = await categoriesService.listCategories(context);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const category = await categoriesService.createCategory(req.body, context);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const category = await categoriesService.getCategoryById(Number(req.params.id), context);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const category = await categoriesService.updateCategory(Number(req.params.id), req.body, context);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const result = await categoriesService.deleteCategory(Number(req.params.id), context);
    if (result.count === 0) {
      return res.status(404).json({ message: 'Category not found or permission denied' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};