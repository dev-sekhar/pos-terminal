import { PrismaClient, Sale } from '@prisma/client';
const prisma = new PrismaClient();

export const listSales = async (tenantId: string): Promise<Sale[]> => {
  return prisma.sale.findMany({
    where: { tenantId, deleted: false },
    orderBy: { datetime: 'desc' },
    include: { items: true },
  });
};

export const createSale = async (data: any, tenantId: string, createdById: number): Promise<Sale> => {
  return prisma.sale.create({
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

export const getSaleById = async (id: number, tenantId: string): Promise<Sale | null> => {
  return prisma.sale.findFirst({
    where: { id, tenantId, deleted: false },
    include: { items: true },
  });
};

export const updateSale = async (id: number, data: any, tenantId: string): Promise<Sale | null> => {
  return prisma.sale.update({
    where: { id },
    data: { ...data, tenantId },
    include: { items: true },
  });
};

export const deleteSale = async (id: number, tenantId: string): Promise<Sale | null> => {
  return prisma.sale.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 