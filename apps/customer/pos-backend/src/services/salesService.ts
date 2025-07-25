import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// This defines the data structure for a sale when it's created
const saleCreateInput = Prisma.validator<Prisma.SaleCreateInput>()({
  // Add fields needed for creation if you have specific logic
});

// List all sales for a given tenant
export const listSales = async (tenantId: string) => {
  return prisma.sale.findMany({
    where: { tenantId, deleted: false },
    include: { items: true, user: true, branch: true } // Include related data
  });
};

// Get a single sale by its ID
export const getSaleById = async (id: number, tenantId: string) => {
  return prisma.sale.findFirst({
    where: { id, tenantId, deleted: false },
    include: { items: { include: { product: true } } }
  });
};

// Create a new sale
export const createSale = async (data: Prisma.SaleCreateInput, tenantId: string, createdById: number) => {
  // Your existing creation logic goes here. 
  // This is a basic placeholder.
  return prisma.sale.create({
    data: {
      ...data,
      tenant: { connect: { id: tenantId } },
      createdBy: { connect: { id: createdById } },
    }
  });
};

// Update an existing sale
export const updateSale = async (id: number, data: Prisma.SaleUpdateInput, tenantId: string) => {
    return prisma.sale.updateMany({
        where: { id, tenantId },
        data,
    });
};

// Delete a sale (soft delete)
export const deleteSale = async (id: number, tenantId: string) => {
    return prisma.sale.updateMany({
        where: { id, tenantId },
        data: { deleted: true }
    });
};