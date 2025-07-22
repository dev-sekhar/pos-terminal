import { PrismaClient, Supplier } from '@prisma/client';
const prisma = new PrismaClient();

export const listSuppliers = async (tenantId: string): Promise<Supplier[]> => {
  return prisma.supplier.findMany({
    where: { tenantId, deleted: false },
    orderBy: { name: 'asc' },
  });
};

export const createSupplier = async (data: any, tenantId: string, createdById: number): Promise<Supplier> => {
  return prisma.supplier.create({
    data: {
      ...data,
      tenantId,
      createdById,
      active: true,
      deleted: false,
    },
  });
};

export const getSupplierById = async (id: number, tenantId: string): Promise<Supplier | null> => {
  return prisma.supplier.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

export const updateSupplier = async (id: number, data: any, tenantId: string): Promise<Supplier | null> => {
  return prisma.supplier.update({
    where: { id },
    data: { ...data, tenantId },
  });
};

export const deleteSupplier = async (id: number, tenantId: string): Promise<Supplier | null> => {
  return prisma.supplier.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 