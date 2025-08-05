import { PrismaClient, Prisma, Inventory, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma'; // Use the shared prisma client

export const listInventory = async (requestingUser: UserContextPayload): Promise<Inventory[]> => {
  const { tenantId, role, branchId } = requestingUser;
  
  const whereClause: Prisma.InventoryWhereInput = {
    tenantId: tenantId,
  };

  // --- THIS IS THE FIX ---
  // Apply the branch filter for ANY role that is not an ADMIN.
  if (role !== Role.ADMIN) {
    whereClause.branchId = branchId;
  }
  
  return prisma.inventory.findMany({
    where: whereClause,
    include: { product: true, branch: true },
    orderBy: { product: { name: 'asc' } },
  });
};

export const getInventoryById = async (id: number, requestingUser: UserContextPayload): Promise<Inventory | null> => {
  const { tenantId, role, branchId } = requestingUser;

  const whereClause: Prisma.InventoryWhereInput = {
    id,
    tenantId: tenantId,
  };

  // Apply the same robust logic here
  if (role !== Role.ADMIN) {
    whereClause.branchId = branchId;
  }
  
  return prisma.inventory.findFirst({ where: whereClause, include: { product: true, branch: true } });
};

export const createInventory = async (data: Prisma.InventoryUncheckedCreateInput, requestingUser: UserContextPayload): Promise<Inventory> => {
  let { productId, branchId, stock, reorderLevel } = data;
  const { role, id: createdById, tenantId } = requestingUser;
  
  // A Manager or Cashier can only add inventory to their own branch.
  if (role !== Role.ADMIN) {
    branchId = requestingUser.branchId;
  }
  
  if (!branchId) throw new Error("Branch ID is required.");
  
  const numericStock = Number(stock);
  const numericReorderLevel = Number(reorderLevel) || 10;
  
  if (numericReorderLevel > numericStock) {
    throw new Error("Validation failed: Reorder level cannot be greater than the stock quantity.");
  }
  
  return prisma.inventory.create({
    data: {
      stock: numericStock,
      reorderLevel: numericReorderLevel,
      tenantId: tenantId,
      productId,
      branchId,
      createdById: createdById,
    },
  });
};

export const updateInventory = async (id: number, data: any, requestingUser: UserContextPayload): Promise<Inventory | null> => {
  const { stock, reorderLevel } = data;
  const { tenantId, role, branchId } = requestingUser;
  
  const whereClause: Prisma.InventoryWhereInput = { id, tenantId: tenantId };
  if (role !== Role.ADMIN) {
      whereClause.branchId = branchId;
  }
  
  const existingItem = await prisma.inventory.findFirst({ where: whereClause });
  if (!existingItem) {
    return null; // Return null instead of throwing an error for better controller handling
  }

  const finalStock = stock !== undefined ? Number(stock) : existingItem.stock;
  const finalReorderLevel = reorderLevel !== undefined ? Number(reorderLevel) : existingItem.reorderLevel;
  
  if (finalReorderLevel > finalStock) {
    throw new Error("Validation failed: Reorder level cannot be greater than the stock quantity.");
  }
  
  // Use .update instead of .updateMany when you have the unique ID.
  return prisma.inventory.update({
    where: { id: existingItem.id },
    data: { stock: finalStock, reorderLevel: finalReorderLevel },
  });
};


export const listInventoryForSales = async (requestingUser: UserContextPayload) => {
  return prisma.inventory.findMany({
    where: {
      tenantId: requestingUser.tenantId,
    },
    include: { product: true, branch: true },
    orderBy: { product: { name: 'asc' } }
  });
};

export const deleteInventory = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
  const { tenantId, role, branchId } = requestingUser;
  
  const whereClause: Prisma.InventoryWhereInput = { id, tenantId: tenantId };
  if (role !== Role.ADMIN) {
      whereClause.branchId = branchId;
  }
  
  // Use deleteMany with the where clause to ensure security and atomicity
  return prisma.inventory.deleteMany({
    where: whereClause,
  });
};