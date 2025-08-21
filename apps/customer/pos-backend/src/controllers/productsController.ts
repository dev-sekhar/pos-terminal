import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as productsService from '../services/productsService';
// We no longer need prisma in the controller.

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

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const products = await productsService.listProducts(context);
    res.json(products);
  } catch (err) { 
    next(err); 
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const product = await productsService.createProduct(req.body, context);
    res.status(201).json(product);
  } catch (err) { 
    next(err); 
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const product = await productsService.getProductById(Number(req.params.id), context);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { 
    next(err); 
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const product = await productsService.updateProduct(Number(req.params.id), req.body, context);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { 
    next(err); 
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const result = await productsService.deleteProduct(Number(req.params.id), context);
    if (result.count === 0) return res.status(404).json({ message: 'Product not found or permission denied' });
    res.status(204).send();
  } catch (err) { 
    next(err); 
  }
};

export const getNewProductCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const context = createServiceContext(req as AuthenticatedRequest);
        const code = await productsService.generateNewProductCode(context);
        console.log('Generated product code:', code);
        res.json({ code });
    } catch (err) { 
        console.error('Error generating product code:', err);
        next(err); 
    }
};

export const importProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const context = createServiceContext(req as AuthenticatedRequest);
        const { products } = req.body; 
        if (!Array.isArray(products)) {
            return res.status(400).json({ message: "Request body must have a 'products' array." });
        }
        const result = await productsService.importProductsFromCSV(products, context);
        res.status(201).json(result);
    } catch (err) { 
        next(err); 
    }
};