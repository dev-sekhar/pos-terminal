import { PrismaClient, Prisma, Sale, Inventory, Product } from '@prisma/client';

const prisma = new PrismaClient();

// List all sales for a tenant, including all related data for display
export const listSales = async (tenantId: string) => {
  return prisma.sale.findMany({
    where: { tenantId, deleted: false },
    include: {
      items: { include: { product: true } },
      user: true, // The salesperson
      branch: true,
      createdBy: true,
    },
    orderBy: { datetime: 'desc' }
  });
};

// Get a single sale by its ID
export const getSaleById = async (id: number, tenantId: string) => {
  return prisma.sale.findFirst({
    where: { id, tenantId, deleted: false },
    include: { items: { include: { product: true } }, user: true, branch: true }
  });
};

// Create a new sale with inventory validation and decrement
export const createSale = async (data: any, tenantId: string, createdById: number): Promise<Sale> => {
  const { branchId, userId, invoice, datetime, paymentType, discount, items } = data;

  if (!branchId) throw new Error("Branch is required to create a sale.");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("A sale must have at least one item.");
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const productIds = items.map((item: { productId: number }) => item.productId);
    
    const inventoryItems = await tx.inventory.findMany({
      where: {
        tenantId,
        branchId,
        productId: { in: productIds },
      },
    });

    for (const item of items) {
      const inventoryItem = inventoryItems.find((inv: Inventory) => inv.productId === item.productId);
      if (!inventoryItem) {
        throw new Error(`Product (ID: ${item.productId}) is not available in this branch's inventory.`);
      }
      if (inventoryItem.stock < item.quantity) {
        throw new Error(`Insufficient stock for Product ID ${item.productId}. Available: ${inventoryItem.stock}, Requested: ${item.quantity}.`);
      }
    }

    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const total = items.reduce((sum: number, item: any) => {
      const product = products.find((p: Product) => p.id === item.productId)!;
      const base = (item.quantity || 0) * product.price;
      const itemDiscount = base * (Number(item.discount || 0) / 100);
      const taxed = (base - itemDiscount) * (1 + Number(item.tax || 0) / 100);
      return sum + taxed;
    }, 0);
    const finalTotal = total * (1 - (Number(discount || 0) / 100));

    const newSale = await tx.sale.create({
      data: {
        invoice, datetime: new Date(datetime), paymentType, total: finalTotal, discount: Number(discount || 0),
        tenant: { connect: { id: tenantId } },
        branch: { connect: { id: branchId } },
        user: { connect: { id: userId } },
        createdBy: { connect: { id: createdById } },
      }
    });

    const itemsToCreate = items.map((item: any) => ({
      quantity: Number(item.quantity),
      price: products.find((p: Product) => p.id === item.productId)!.price,
      discount: Number(item.discount || 0),
      tax: Number(item.tax || 0),
      tenantId, productId: item.productId, saleId: newSale.id,
    }));
    await tx.saleItem.createMany({ data: itemsToCreate });

    for (const item of items) {
      await tx.inventory.updateMany({
        where: { tenantId, branchId, productId: item.productId },
        data: { stock: { decrement: Number(item.quantity) } },
      });
    }

    return newSale;
  });
};

// Soft delete a sale
export const deleteSale = async (id: number, tenantId: string) => {
  return prisma.sale.updateMany({
    where: { id, tenantId },
    data: { deleted: true }
  });
};

// Generate a new, unique invoice number for the tenant
export const generateNewInvoiceNumber = async (tenantId: string): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `S-${datePart}-`;
    const lastSale = await prisma.sale.findFirst({
        where: { tenantId, invoice: { startsWith: prefix } },
        orderBy: { invoice: 'desc' },
    });
    let nextNum = 1;
    if (lastSale) {
        const lastNum = parseInt(lastSale.invoice.split('-')[2], 10);
        nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
};