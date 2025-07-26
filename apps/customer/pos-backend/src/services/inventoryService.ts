import { PrismaClient, Prisma, Inventory } from '@prisma/client';

const prisma = new PrismaClient();

// List all non-deleted inventory records for a tenant
export const listInventory = async (tenantId: string): Promise<Inventory[]> => {
  return prisma.inventory.findMany({
    where: { tenantId, deleted: false },
    include: { product: true, branch: true },
    orderBy: { product: { name: 'asc' } },
  });
};

// Get a single inventory record by its ID
export const getInventoryById = async (id: number, tenantId: string): Promise<Inventory | null> => {
  return prisma.inventory.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

// Create a new inventory record with validation
export const createInventory = async (data: Prisma.InventoryUncheckedCreateInput, tenantId: string, createdById: number): Promise<Inventory> => {
  const { productId, branchId, stock, reorderLevel } = data;
  
  const numericStock = Number(stock);
  const numericReorderLevel = Number(reorderLevel) || 10;

  // --- THIS IS THE FIX (Part 1) ---
  // Enforce the new business rule on creation.
  if (numericReorderLevel > numericStock) {
    throw new Error("Validation failed: Reorder level cannot be greater than the stock quantity.");
  }

  return prisma.inventory.create({
    data: {
      stock: numericStock,
      reorderLevel: numericReorderLevel,
      tenantId,
      productId,
      branchId,
      createdById,
    },
  });
};

// Update an existing inventory record with validation
export const updateInventory = async (id: number, data: any, tenantId: string): Promise<Inventory | null> => {
  const { stock, reorderLevel } = data;

  const dataToUpdate: Prisma.InventoryUpdateInput = {};
  if (stock !== undefined) dataToUpdate.stock = Number(stock);
  if (reorderLevel !== undefined) dataToUpdate.reorderLevel = Number(reorderLevel);

  // --- THIS IS THE FIX (Part 2) ---
  // To validate an update, we must know the final state of the record.
  // 1. Fetch the existing record first.
  const existingItem = await prisma.inventory.findFirst({ where: { id, tenantId } });
  if (!existingItem) {
    throw new Error("Inventory item not found.");
  }

  // 2. Determine the final values after the update is applied.
  const finalStock = dataToUpdate.stock !== undefined ? Number(dataToUpdate.stock) : existingItem.stock;
  const finalReorderLevel = dataToUpdate.reorderLevel !== undefined ? Number(dataToUpdate.reorderLevel) : existingItem.reorderLevel;

  // 3. Enforce the business rule.
  if (finalReorderLevel > finalStock) {
    throw new Error("Validation failed: Reorder level cannot be greater than the stock quantity.");
  }

  // 4. If validation passes, proceed with the update.
  await prisma.inventory.updateMany({
    where: { id, tenantId },
    data: dataToUpdate,
  });

  return getInventoryById(id, tenantId);
};

// Soft delete an inventory record
export const deleteInventory = async (id: number, tenantId: string): Promise<{ count: number }> => {
  return prisma.inventory.updateMany({
    where: { id, tenantId },
    data: { deleted: true },
  });
};