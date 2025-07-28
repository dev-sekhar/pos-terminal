import { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/productsService';
import { UserContextPayload } from '../types/custom';
import { Role } from '@prisma/client';

const getUserFromRequest = (req: Request): UserContextPayload => {
    const user = req.user;
    if (!user) throw new Error('User context is missing from the request session.');
    return { id: Number(user.id), tenantId: user.tenantId, role: user.role, branchId: user.branchId };
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const products = await productsService.listProducts(requestingUser);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const product = await productsService.createProduct(req.body, requestingUser);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const product = await productsService.getProductById(Number(req.params.id), requestingUser);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const product = await productsService.updateProduct(Number(req.params.id), req.body, requestingUser);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const result = await productsService.deleteProduct(Number(req.params.id), requestingUser);
    if (result.count === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getNewProductCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const newCode = await productsService.generateNewProductCode(requestingUser);
    res.json({ code: newCode });
  } catch (err) {
    next(err);
  }
};

export const importProducts = async (req: Request, res: Response, next: NextFunction) => {
    console.log("--- Step 4: Backend /api/products/import endpoint hit ---");
    try {
        const requestingUser = getUserFromRequest(req);
        const { products } = req.body; 
        console.log("Received payload with", products?.length, "products.");

        if (!Array.isArray(products)) {
            return res.status(400).json({ message: "Request body must have a 'products' array." });
        }
        const result = await productsService.importProductsFromCSV(products, requestingUser);
        console.log("Service operation successful, result:", result);
        res.status(201).json(result);
    } catch (err) {
        console.error("--- ERROR in importProducts controller ---", err);
        next(err);
    }
};