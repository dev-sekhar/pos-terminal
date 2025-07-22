import { PrismaClient, ProductCategory } from '@prisma/client';
const prisma = new PrismaClient();

export const listCategories = async (tenantId: string): Promise<ProductCategory[]> => {
  return prisma.productCategory.findMany({
    where: { tenantId, deleted: false },
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (data: any, tenantId: string, createdById: number): Promise<ProductCategory> => {
  return prisma.productCategory.create({
    data: {
      ...data,
      tenantId,
      createdById,
      active: true,
      deleted: false,
    },
  });
};

export const getCategoryById = async (id: number, tenantId: string): Promise<ProductCategory | null> => {
  return prisma.productCategory.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

export const updateCategory = async (id: number, data: any, tenantId: string): Promise<ProductCategory | null> => {
  return prisma.productCategory.update({
    where: { id },
    data: { ...data, tenantId },
  });
};

export const deleteCategory = async (id: number, tenantId: string): Promise<ProductCategory | null> => {
  return prisma.productCategory.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 