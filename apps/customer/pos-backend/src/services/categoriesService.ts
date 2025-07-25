import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// List all non-deleted categories for a tenant, including the user who created them
export const listCategories = async (tenantId: string) => {
  return prisma.productCategory.findMany({
    where: { tenantId, deleted: false },
    include: {
      createdBy: { // Include the related User model
        select: { name: true } // Only select the user's name
      }
    },
    orderBy: { name: 'asc' },
  });
};

// Create a new category using precise Prisma types
export const createCategory = async (data: { name: string, description?: string | null, createdById: number }, tenantId: string) => {
  const { name, description, createdById } = data;
  return prisma.productCategory.create({
    data: {
      name,
      description,
      tenant: { connect: { id: tenantId } },
      createdBy: { connect: { id: createdById } }, // Connect via the relation
    },
  });
};

// Get a single category by its ID for a specific tenant
export const getCategoryById = async (id: number, tenantId: string) => {
  return prisma.productCategory.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

// Update a category
export const updateCategory = async (id: number, data: Prisma.ProductCategoryUpdateInput, tenantId: string) => {
  return prisma.productCategory.updateMany({
    where: { id, tenantId },
    data,
  }).then(() => getCategoryById(id, tenantId));
};

// Soft delete a category
export const deleteCategory = async (id: number, tenantId: string) => {
  return prisma.productCategory.updateMany({
    where: { id, tenantId },
    data: { deleted: true },
  });
};