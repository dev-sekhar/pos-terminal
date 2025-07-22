import { PrismaClient, Inventory } from '@prisma/client';
const prisma = new PrismaClient();

export const listInventory = async (tenantId: string): Promise<Inventory[]> => {
  return prisma.inventory.findMany({
    where: { tenantId, deleted: false },
    orderBy: { id: 'asc' },
  });
};

export const createInventory = async (data: any, tenantId: string, createdById: number): Promise<Inventory> => {
  return prisma.inventory.create({
    data: {
      ...data,
      tenantId,
      createdById,
      deleted: false,
    },
  });
};

export const getInventoryById = async (id: number, tenantId: string): Promise<Inventory | null> => {
  return prisma.inventory.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

export const updateInventory = async (id: number, data: any, tenantId: string): Promise<Inventory | null> => {
  return prisma.inventory.update({
    where: { id },
    data: { ...data, tenantId },
  });
};

export const deleteInventory = async (id: number, tenantId: string): Promise<Inventory | null> => {
  return prisma.inventory.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 