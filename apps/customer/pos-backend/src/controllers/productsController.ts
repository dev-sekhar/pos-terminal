import { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/productsService';

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

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const products = await productsService.listProducts(tenantId);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const product = await productsService.createProduct(req.body, tenantId, createdById);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const product = await productsService.getProductById(Number(req.params.id), tenantId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const product = await productsService.updateProduct(Number(req.params.id), req.body, tenantId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await productsService.deleteProduct(Number(req.params.id), tenantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// --- New Advanced Controllers ---

export const getNewProductCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getTenantId(req);
        const code = await productsService.generateNewProductCode(tenantId);
        res.json({ code });
    } catch (err) {
        next(err);
    }
};

export const importProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getTenantId(req);
        const createdById = getUserId(req);
        // Assuming the request body is an array of product objects
        const products = req.body.products; 
        if (!Array.isArray(products)) {
            return res.status(400).json({ message: "Request body must be an object with a 'products' array." });
        }
        const result = await productsService.importProductsFromCSV(products, tenantId, createdById);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};