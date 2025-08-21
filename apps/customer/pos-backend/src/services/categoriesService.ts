import { PrismaClient, Prisma, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

export const listCategories = async (requestingUser: UserContextPayload) => {
  return prisma.productCategory.findMany({
    where: { tenantId: requestingUser.tenantId, deleted: false },
    include: { createdBy: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (data: { name: string, description?: string | null }, requestingUser: UserContextPayload) => {
  const { name, description } = data;
  return prisma.productCategory.create({
    data: {
      name,
      description,
      tenant: { connect: { id: requestingUser.tenantId } },
      createdBy: { connect: { id: requestingUser.id } },
    },
  });
};

export const getCategoryById = async (id: number, requestingUser: UserContextPayload) => {
  return prisma.productCategory.findFirst({
    where: { id, tenantId: requestingUser.tenantId, deleted: false },
  });
};

export const updateCategory = async (id: number, data: Prisma.ProductCategoryUpdateInput, requestingUser: UserContextPayload) => {
  // Filter out userName from data since it's not a valid ProductCategory field
  const { userName, ...validData } = data as any;
  
  await prisma.productCategory.updateMany({ where: { id, tenantId: requestingUser.tenantId }, data: validData });
  return getCategoryById(id, requestingUser);
};

export const deleteCategory = async (id: number, requestingUser: UserContextPayload) => {
  return prisma.productCategory.updateMany({
    where: { id, tenantId: requestingUser.tenantId },
    data: { deleted: true },
  });
};