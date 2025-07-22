import { PrismaClient, Product } from '@prisma/client';
const prisma = new PrismaClient();

export const listProducts = async (tenantId: string): Promise<Product[]> => {
  return prisma.product.findMany({
    where: { tenantId, deleted: false },
    orderBy: { name: 'asc' },
  });
};

export const createProduct = async (data: any, tenantId: string): Promise<Product> => {
  return prisma.product.create({
    data: {
      ...data,
      tenantId,
      active: true,
      deleted: false,
    },
  });
};

export const getProductById = async (id: number, tenantId: string): Promise<Product | null> => {
  return prisma.product.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

export const updateProduct = async (id: number, data: any, tenantId: string): Promise<Product | null> => {
  return prisma.product.update({
    where: { id },
    data: { ...data, tenantId },
  });
};

export const deleteProduct = async (id: number, tenantId: string): Promise<Product | null> => {
  return prisma.product.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 