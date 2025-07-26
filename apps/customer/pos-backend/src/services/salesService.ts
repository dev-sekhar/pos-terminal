import { PrismaClient, Prisma, Sale } from '@prisma/client';

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

// Create a new sale and its items in a single, safe transaction
export const createSale = async (data: any, tenantId: string, createdById: number) => {
  const { branchId, userId, invoice, datetime, paymentType, discount, items } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("A sale must have at least one item.");
  }

  // --- Backend Calculation: Never trust totals from the frontend ---
  const productIds = items.map((item: { productId: number }) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  const total = items.reduce((sum: number, item: any) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
    
    const base = (item.quantity || 0) * (product.price || 0);
    const itemDiscount = base * (Number(item.discount || 0) / 100);
    const taxed = (base - itemDiscount) * (1 + Number(item.tax || 0) / 100);
    return sum + taxed;
  }, 0);
  const finalTotal = total * (1 - (Number(discount || 0) / 100));
  // --- End of Backend Calculation ---

  return prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        invoice,
        datetime: new Date(datetime),
        paymentType,
        total: finalTotal,
        discount: Number(discount || 0),
        tenant: { connect: { id: tenantId } },
        branch: { connect: { id: branchId } },
        user: { connect: { id: userId } }, // The salesperson
        createdBy: { connect: { id: createdById } },
      }
    });

    const itemsToCreate = items.map((item: any) => ({
      quantity: Number(item.quantity),
      price: products.find(p => p.id === item.productId)!.price, // Use the real price from the DB
      discount: Number(item.discount || 0),
      tax: Number(item.tax || 0),
      tenantId,
      productId: item.productId,
      saleId: newSale.id,
    }));
    
    await tx.saleItem.createMany({ data: itemsToCreate });
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