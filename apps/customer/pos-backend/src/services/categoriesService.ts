import { PrismaClient, Prisma, User } from '@prisma/client';

const prisma = new PrismaClient();

export const listCategories = async (requestingUser: User) => {
  return prisma.productCategory.findMany({
    where: { tenantId: requestingUser.tenantId, deleted: false },
    include: { createdBy: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (data: { name: string, description?: string | null }, requestingUser: User) => {
  const { name, description } = data;
  return prisma.productCategory.create({
    data: {
      name, description,
      tenant: { connect: { id: requestingUser.tenantId } },
      createdBy: { connect: { id: requestingUser.id } },
    },
  });
};

export const getCategoryById = async (id: number, requestingUser: User) => {
  return prisma.productCategory.findFirst({
    where: { id, tenantId: requestingUser.tenantId, deleted: false },
  });
};

export const updateCategory = async (id: number, data: Prisma.ProductCategoryUpdateInput, requestingUser: User) => {
  await prisma.productCategory.updateMany({ where: { id, tenantId: requestingUser.tenantId }, data });
  return getCategoryById(id, requestingUser);
};

export const deleteCategory = async (id: number, requestingUser: User) => {
  return prisma.productCategory.updateMany({
    where: { id, tenantId: requestingUser.tenantId },
    data: { deleted: true },
  });
};