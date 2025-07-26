import { PrismaClient, Prisma, Purchase } from '@prisma/client';

const prisma = new PrismaClient();

// List all non-deleted purchases for a tenant, including related data
export const listPurchases = async (tenantId: string): Promise<Purchase[]> => {
  return prisma.purchase.findMany({
    where: { tenantId, deleted: false },
    include: {
      items: { include: { product: true } },
      supplier: true,
      branch: true,
      createdBy: true,
    },
    orderBy: { datetime: 'desc' },
  });
};

// Get a single purchase by its ID
export const getPurchaseById = async (id: number, tenantId: string): Promise<Purchase | null> => {
  return prisma.purchase.findFirst({
    where: { id, tenantId, deleted: false },
    include: { items: { include: { product: true } }, supplier: true, branch: true },
  });
};

// Create a new purchase and its items in a single transaction
export const createPurchase = async (data: any, tenantId: string, createdById: number): Promise<Purchase> => {
  const { supplierId, branchId, poNumber, datetime, items } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("A purchase must have at least one item.");
  }

  // The total is now 0 by default, as prices are not yet known.
  const total = 0;

  return prisma.$transaction(async (tx) => {
    const newPurchase = await tx.purchase.create({
      data: {
        poNumber,
        datetime: new Date(datetime),
        total, // Initially 0
        tenant: { connect: { id: tenantId } },
        supplier: { connect: { id: supplierId } },
        branch: { connect: { id: branchId } },
        createdBy: { connect: { id: createdById } },
      }
    });

    // Create the nested purchase items, which now only require productId and quantity.
    // Price will default to 0 as defined in the schema.
    const itemsToCreate = items.map((item: { productId: number; quantity: number }) => ({
      productId: item.productId,
      quantity: item.quantity,
      tenantId,
      purchaseId: newPurchase.id,
    }));
    
    await tx.purchaseItem.createMany({
      data: itemsToCreate,
    });

    // We must return the created purchase object from the transaction block.
    // It's good practice to re-fetch it to include relations.
    const result = await tx.purchase.findUnique({
        where: { id: newPurchase.id },
        include: { items: true }
    });

    if (!result) {
        throw new Error("Failed to create or find the purchase after transaction.");
    }

    return result;
  });
};

// Soft delete a purchase
export const deletePurchase = async (id: number, tenantId: string): Promise<{ count: number }> => {
  return prisma.purchase.updateMany({
    where: { id, tenantId },
    data: { deleted: true },
  });
};

// Generate a new, unique PO Number for the tenant
export const generateNewPONumber = async (tenantId: string): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `PO-${datePart}-`;

    const lastPurchase = await prisma.purchase.findFirst({
        where: { tenantId, poNumber: { startsWith: prefix } },
        orderBy: { poNumber: 'desc' },
    });

    let nextNum = 1;
    if (lastPurchase) {
        // Safely parse the last part of the PO number
        const lastNumPart = lastPurchase.poNumber.split('-')[2];
        const lastNum = parseInt(lastNumPart, 10);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
};