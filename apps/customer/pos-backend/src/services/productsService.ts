import { PrismaClient, Prisma, Product } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma'; // Use the shared prisma client

// --- THIS IS THE CORRECTED listProducts FUNCTION ---
// Products are tenant-level entities. Managers and Admins should see all products
// regardless of their branch assignment. Filtering happens at the inventory level.
export const listProducts = async (requestingUser: UserContextPayload): Promise<Product[]> => {
  return prisma.product.findMany({
    where: { 
      tenantId: requestingUser.tenantId, 
      deleted: false 
    },
    include: { 
      productCategory: true,
      createdBy: true // Eager load the creator's info
    },
    orderBy: { name: 'asc' },
  });
};

export const createProduct = async (data: Prisma.ProductUncheckedCreateInput, requestingUser: UserContextPayload): Promise<Product> => {
  const { name, code, unit, price, productCategoryId } = data;
  const numericPrice = parseFloat(String(price));
  if (isNaN(numericPrice)) throw new Error("Invalid price.");

  return prisma.product.create({
    data: {
      name, code, unit, price: numericPrice, productCategoryId,
      tenantId: requestingUser.tenantId,
      createdById: requestingUser.id,
    },
  });
};

// Get a single product, scoped only by tenant.
export const getProductById = async (id: number, requestingUser: UserContextPayload): Promise<Product | null> => {
  return prisma.product.findFirst({
    where: { 
      id, 
      tenantId: requestingUser.tenantId, 
      deleted: false 
    },
    include: { productCategory: true } // Include category for detail views
  });
};

// Update a product, scoped only by tenant.
export const updateProduct = async (id: number, data: Prisma.ProductUpdateInput, requestingUser: UserContextPayload): Promise<Product | null> => {
  // First, verify the product belongs to the tenant before updating.
  const productExists = await prisma.product.findFirst({
    where: { id, tenantId: requestingUser.tenantId }
  });
  
  if (!productExists) {
    return null; // Or throw an error: throw new Error("Product not found or permission denied.");
  }

  // Filter out userName from data since it's not a valid Product field
  const { userName, ...validData } = data as any;
  
  return prisma.product.update({ 
    where: { id }, 
    data: validData 
  });
};

// Soft-delete a product, scoped only by tenant.
export const deleteProduct = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
  // updateMany is safe here because the where clause scopes it to the specific product AND tenant.
  return prisma.product.updateMany({
    where: { 
      id, 
      tenantId: requestingUser.tenantId 
    },
    data: { deleted: true },
  });
};

export const generateNewProductCode = async (requestingUser: UserContextPayload): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `P${datePart}-`;
    const lastProduct = await prisma.product.findFirst({
        where: { tenantId: requestingUser.tenantId, code: { startsWith: prefix } },
        orderBy: { code: 'desc' },
    });
    let nextNum = 1;
    if (lastProduct) {
        // Correctly split by the last '-', not the first.
        const parts = lastProduct.code.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

export const importProductsFromCSV = async (products: Prisma.ProductUncheckedCreateInput[], requestingUser: UserContextPayload) => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `P${datePart}-`;
    
    const lastProduct = await prisma.product.findFirst({
        where: { tenantId: requestingUser.tenantId, code: { startsWith: prefix } },
        orderBy: { code: 'desc' },
    });

    let nextNum = 1;
    if (lastProduct) {
        const parts = lastProduct.code.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }
    
    const productsToCreate = products.map((p, index) => {
        const newCode = `${prefix}${String(nextNum + index).padStart(3, '0')}`;
        return {
            name: p.name,
            unit: p.unit,
            price: Number(p.price),
            productCategoryId: p.productCategoryId,
            code: newCode,
            tenantId: requestingUser.tenantId,
            createdById: requestingUser.id,
        };
    });

    return prisma.product.createMany({
        data: productsToCreate,
        skipDuplicates: true,
    });
};