import { PrismaClient, Prisma, Purchase, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

// List purchases, scoped for Managers
export const listPurchases = async (requestingUser: UserContextPayload): Promise<Purchase[]> => {
  const whereClause: Prisma.PurchaseWhereInput = {
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }

  return prisma.purchase.findMany({
    where: whereClause,
    include: { items: { include: { product: true } }, supplier: true, branch: true, createdBy: true, },
    orderBy: { datetime: 'desc' },
  });
};

// Get a single purchase, scoped for Managers
export const getPurchaseById = async (id: number, requestingUser: UserContextPayload): Promise<Purchase | null> => {
  const whereClause: Prisma.PurchaseWhereInput = {
    id, tenantId: requestingUser.tenantId, deleted: false
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }

  return prisma.purchase.findFirst({
    where: whereClause,
    include: { items: { include: { product: true } }, supplier: true, branch: true },
  });
};

// Create a new purchase, scoped for Managers
export const createPurchase = async (data: any, requestingUser: UserContextPayload): Promise<Purchase> => {
  let { supplierId, branchId, poNumber, datetime, items } = data;

  if (requestingUser.role === Role.MANAGER) {
    branchId = requestingUser.branchId;
  }
  if (!branchId) throw new Error("Branch ID is required.");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("A purchase must have at least one item.");
  }

  return prisma.$transaction(async (tx) => {
    const newPurchase = await tx.purchase.create({
      data: {
        poNumber, datetime: new Date(datetime), total: 0,
        tenantId: requestingUser.tenantId,
        supplierId,
        branchId,
        createdById: requestingUser.id,
      }
    });

    const itemsToCreate = items.map((item: { productId: number; quantity: number }) => ({
      productId: item.productId,
      quantity: item.quantity,
      tenantId: requestingUser.tenantId,
      purchaseId: newPurchase.id,
    }));
    
    await tx.purchaseItem.createMany({ data: itemsToCreate });
    const result = await tx.purchase.findUnique({ where: { id: newPurchase.id }, include: { items: true } });
    if (!result) throw new Error("Failed to create purchase.");
    return result;
  });
};

// Soft delete a purchase, scoped for Managers
export const deletePurchase = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
  const purchaseToDelete = await getPurchaseById(id, requestingUser);
  if (!purchaseToDelete) {
    return { count: 0 };
  }
  return prisma.purchase.updateMany({
    where: { id: purchaseToDelete.id },
    data: { deleted: true },
  });
};

// Generate a PO number (no RBAC needed, just tenant context)
export const generateNewPONumber = async (requestingUser: UserContextPayload): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PO-${datePart}-`;

    const lastPurchase = await prisma.purchase.findFirst({
        where: { tenantId: requestingUser.tenantId, poNumber: { startsWith: prefix } },
        orderBy: { poNumber: 'desc' },
    });

    let nextNum = 1;
    if (lastPurchase) {
        const lastNum = parseInt(lastPurchase.poNumber.split('-')[2], 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
};