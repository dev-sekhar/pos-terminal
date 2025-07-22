import { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/productsService';

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const products = await productsService.listProducts(tenantId);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const product = await productsService.createProduct(req.body, tenantId);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const product = await productsService.getProductById(Number(req.params.id), tenantId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const product = await productsService.updateProduct(Number(req.params.id), req.body, tenantId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const product = await productsService.deleteProduct(Number(req.params.id), tenantId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}; 