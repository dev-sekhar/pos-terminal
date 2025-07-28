import { PrismaClient, Prisma, Inventory, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom'; // 1. IMPORT THE CORRECT TYPE

const prisma = new PrismaClient();

// 2. UPDATE ALL FUNCTION SIGNATURES to use the UserContextPayload
export const listInventory = async (requestingUser: UserContextPayload): Promise<Inventory[]> => {
  const whereClause: Prisma.InventoryWhereInput = {
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }

  return prisma.inventory.findMany({
    where: whereClause,
    include: { product: true, branch: true },
    orderBy: { product: { name: 'asc' } },
  });
};

export const getInventoryById = async (id: number, requestingUser: UserContextPayload): Promise<Inventory | null> => {
  const whereClause: Prisma.InventoryWhereInput = {
    id,
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }
  
  return prisma.inventory.findFirst({ where: whereClause });
};

export const createInventory = async (data: Prisma.InventoryUncheckedCreateInput, requestingUser: UserContextPayload): Promise<Inventory> => {
  let { productId, branchId, stock, reorderLevel } = data;

  if (requestingUser.role === Role.MANAGER) {
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
      tenantId: requestingUser.tenantId,
      productId,
      branchId,
      createdById: requestingUser.id,
    },
  });
};

export const updateInventory = async (id: number, data: any, requestingUser: UserContextPayload): Promise<Inventory | null> => {
  const { stock, reorderLevel } = data;

  const whereClause: Prisma.InventoryWhereInput = { id, tenantId: requestingUser.tenantId };
  if (requestingUser.role === Role.MANAGER) {
      whereClause.branchId = requestingUser.branchId;
  }

  const existingItem = await prisma.inventory.findFirst({ where: whereClause });
  if (!existingItem) {
    throw new Error("Inventory item not found or you do not have permission to edit it.");
  }

  const finalStock = stock !== undefined ? Number(stock) : existingItem.stock;
  const finalReorderLevel = reorderLevel !== undefined ? Number(reorderLevel) : existingItem.reorderLevel;
  if (finalReorderLevel > finalStock) {
    throw new Error("Validation failed: Reorder level cannot be greater than the stock quantity.");
  }

  await prisma.inventory.updateMany({
    where: { id: existingItem.id },
    data: { stock: finalStock, reorderLevel: finalReorderLevel },
  });

  return getInventoryById(id, requestingUser);
};

export const deleteInventory = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
  const whereClause: Prisma.InventoryWhereInput = { id, tenantId: requestingUser.tenantId };
  if (requestingUser.role === Role.MANAGER) {
      whereClause.branchId = requestingUser.branchId;
  }

  const itemToDelete = await prisma.inventory.findFirst({ where: whereClause });
  if (!itemToDelete) {
      return { count: 0 };
  }
  
  return prisma.inventory.updateMany({
    where: { id: itemToDelete.id },
    data: { deleted: true },
  });
};