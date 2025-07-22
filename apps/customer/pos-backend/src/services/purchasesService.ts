import { PrismaClient, Purchase } from '@prisma/client';
const prisma = new PrismaClient();

export const listPurchases = async (tenantId: string): Promise<Purchase[]> => {
  return prisma.purchase.findMany({
    where: { tenantId, deleted: false },
    orderBy: { datetime: 'desc' },
    include: { items: true },
  });
};

export const createPurchase = async (data: any, tenantId: string, createdById: number): Promise<Purchase> => {
  return prisma.purchase.create({
    data: {
      ...data,
      tenantId,
      createdById,
      deleted: false,
      items: data.items ? { create: data.items } : undefined,
    },
    include: { items: true },
  });
};

export const getPurchaseById = async (id: number, tenantId: string): Promise<Purchase | null> => {
  return prisma.purchase.findFirst({
    where: { id, tenantId, deleted: false },
    include: { items: true },
  });
};

export const updatePurchase = async (id: number, data: any, tenantId: string): Promise<Purchase | null> => {
  return prisma.purchase.update({
    where: { id },
    data: { ...data, tenantId },
    include: { items: true },
  });
};

export const deletePurchase = async (id: number, tenantId: string): Promise<Purchase | null> => {
  return prisma.purchase.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 