import { PrismaClient, Prisma, Product } from '@prisma/client';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

export const listProducts = async (requestingUser: UserContextPayload): Promise<Product[]> => {
  return prisma.product.findMany({
    where: { tenantId: requestingUser.tenantId, deleted: false },
    include: { productCategory: true },
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

export const getProductById = async (id: number, requestingUser: UserContextPayload): Promise<Product | null> => {
  return prisma.product.findFirst({
    where: { id, tenantId: requestingUser.tenantId, deleted: false },
  });
};

export const updateProduct = async (id: number, data: Prisma.ProductUpdateInput, requestingUser: UserContextPayload): Promise<Product | null> => {
  await prisma.product.updateMany({ where: { id, tenantId: requestingUser.tenantId }, data });
  return getProductById(id, requestingUser);
};

export const deleteProduct = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
  return prisma.product.updateMany({
    where: { id, tenantId: requestingUser.tenantId },
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
        const lastNum = parseInt(lastProduct.code.split('-')[1], 10);
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
        const lastNum = parseInt(lastProduct.code.split('-')[1], 10);
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