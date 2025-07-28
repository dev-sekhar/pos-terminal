import { PrismaClient, Prisma, Sale, Inventory, Product, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

// List sales, securely scoped by the requesting user's role and branch
export const listSales = async (requestingUser: UserContextPayload) => {
  const whereClause: Prisma.SaleWhereInput = {
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }

  return prisma.sale.findMany({
    where: whereClause,
    include: {
      items: { include: { product: true } },
      user: true,
      branch: true,
      createdBy: true,
    },
    orderBy: { datetime: 'desc' }
  });
};

// Get a single sale by its ID, respecting branch scope for Managers
export const getSaleById = async (id: number, requestingUser: UserContextPayload) => {
    const whereClause: Prisma.SaleWhereInput = {
        id,
        tenantId: requestingUser.tenantId,
        deleted: false,
    };

    if (requestingUser.role === Role.MANAGER) {
        whereClause.branchId = requestingUser.branchId;
    }
    
    return prisma.sale.findFirst({
        where: whereClause,
        include: { items: { include: { product: true } }, user: true, branch: true }
    });
};

// Create a new sale, with inventory validation and decrement
export const createSale = async (data: any, requestingUser: UserContextPayload): Promise<Sale> => {
  let { branchId, userId, invoice, datetime, paymentType, discount, items } = data;

  if (requestingUser.role !== Role.ADMIN) {
    branchId = requestingUser.branchId;
  }
  if (!branchId) throw new Error("Branch is required to create a sale.");
  if (requestingUser.role === Role.CASHIER) {
    userId = requestingUser.id;
  }
  if (!userId) throw new Error("Salesperson (userId) is required.");

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("A sale must have at least one item.");
  }

  return prisma.$transaction(async (tx) => {
    const productIds = items.map((item: { productId: number }) => item.productId);
    
    const inventoryItems = await tx.inventory.findMany({
      where: {
        tenantId: requestingUser.tenantId,
        branchId,
        productId: { in: productIds },
      },
    });

    for (const item of items) {
      const inventoryItem = inventoryItems.find(inv => inv.productId === item.productId);
      if (!inventoryItem) {
        throw new Error(`Product with ID ${item.productId} is not in this branch's inventory.`);
      }
      if (inventoryItem.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}. Available: ${inventoryItem.stock}, Requested: ${item.quantity}.`);
      }
    }

    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const total = items.reduce((sum: number, item: any) => {
      const product = products.find(p => p.id === item.productId)!;
      const base = (item.quantity || 0) * product.price;
      const itemDiscount = base * (Number(item.discount || 0) / 100);
      const taxed = (base - itemDiscount) * (1 + Number(item.tax || 0) / 100);
      return sum + taxed;
    }, 0);
    const finalTotal = total * (1 - (Number(discount || 0) / 100));

    const newSale = await tx.sale.create({
      data: {
        invoice,
        datetime: new Date(datetime),
        paymentType,
        total: finalTotal,
        discount: Number(discount || 0),
        tenantId: requestingUser.tenantId,
        branchId,
        userId,
        createdById: requestingUser.id,
      }
    });

    const itemsToCreate = items.map((item: any) => ({
      quantity: Number(item.quantity),
      price: products.find(p => p.id === item.productId)!.price,
      discount: Number(item.discount || 0),
      tax: Number(item.tax || 0),
      tenantId: requestingUser.tenantId,
      productId: item.productId,
      saleId: newSale.id,
    }));
    await tx.saleItem.createMany({ data: itemsToCreate });

    for (const item of items) {
      await tx.inventory.updateMany({
        where: { tenantId: requestingUser.tenantId, branchId, productId: item.productId },
        data: { stock: { decrement: Number(item.quantity) } },
      });
    }

    return newSale;
  });
};

// Soft delete a sale, respecting branch scope for Managers
export const deleteSale = async (id: number, requestingUser: UserContextPayload) => {
  const whereClause: Prisma.SaleWhereInput = {
      id,
      tenantId: requestingUser.tenantId
  };

  if (requestingUser.role === Role.MANAGER) {
      whereClause.branchId = requestingUser.branchId;
  }
  
  const saleToDelete = await prisma.sale.findFirst({ where: whereClause });
  if (!saleToDelete) {
      return { count: 0 };
  }

  return prisma.sale.updateMany({
    where: { id: saleToDelete.id },
    data: { deleted: true }
  });
};

// Generate a new, unique invoice number for the tenant
export const generateNewInvoiceNumber = async (requestingUser: UserContextPayload): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `S-${datePart}-`;
    const lastSale = await prisma.sale.findFirst({
        where: { tenantId: requestingUser.tenantId, invoice: { startsWith: prefix } },
        orderBy: { invoice: 'desc' },
    });
    let nextNum = 1;
    if (lastSale) {
        const lastNum = parseInt(lastSale.invoice.split('-')[2], 10);
        if(!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
};