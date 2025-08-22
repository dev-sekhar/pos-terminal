import { Prisma, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma';

export const generateReports = async (requestingUser: UserContextPayload) => {
  const { tenantId, role, branchId } = requestingUser;

  const scopeWhereClause: Prisma.SaleWhereInput = {
    tenantId: tenantId,
    deleted: false,
  };

  if (role === Role.MANAGER) {
    scopeWhereClause.branchId = branchId;
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const [salesToday, salesThisMonth, salesThisYear, topProducts, lowStockItems, recentSales, branchSales] = await Promise.all([
    // Sales Today
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        ...scopeWhereClause,
        datetime: { gte: todayStart, lte: todayEnd }
      }
    }),
    
    // Sales This Month
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        ...scopeWhereClause,
        datetime: { gte: monthStart }
      }
    }),
    
    // Sales This Year
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        ...scopeWhereClause,
        datetime: { gte: yearStart }
      }
    }),
    
    // Top 5 Products This Month
    prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        tenantId,
        sale: {
          ...scopeWhereClause,
          datetime: { gte: monthStart }
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    
    // Low Stock Items
    prisma.inventory.findMany({
      where: {
        tenantId,
        branchId: role === Role.MANAGER ? branchId : undefined,
        deleted: false,
        stock: { lte: prisma.inventory.fields.reorderLevel }
      },
      include: { product: true, branch: true },
      take: 10
    }),
    
    // Recent Sales (Last 10)
    prisma.sale.findMany({
      where: scopeWhereClause,
      include: { user: true, branch: true },
      orderBy: { datetime: 'desc' },
      take: 10
    }),
    
    // Branch-wise Sales This Month (only for Admins)
    role === Role.ADMIN ? prisma.sale.groupBy({
      by: ['branchId'],
      _sum: { total: true },
      _count: true,
      where: {
        tenantId,
        deleted: false,
        datetime: { gte: monthStart }
      },
      orderBy: { _sum: { total: 'desc' } }
    }) : []
  ]);

  // Get product names for top products
  const productIds = topProducts.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId },
    select: { id: true, name: true }
  });

  const topProductsWithNames = topProducts.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      productName: product?.name || 'Unknown',
      quantity: item._sum.quantity || 0
    };
  });

  return {
    summary: {
      salesToday: {
        total: salesToday._sum.total || 0,
        count: salesToday._count || 0
      },
      salesThisMonth: {
        total: salesThisMonth._sum.total || 0,
        count: salesThisMonth._count || 0
      },
      salesThisYear: {
        total: salesThisYear._sum.total || 0,
        count: salesThisYear._count || 0
      }
    },
    topProducts: topProductsWithNames,
    lowStockItems: lowStockItems.map(item => ({
      productName: item.product.name,
      branchName: item.branch.name,
      currentStock: item.stock,
      reorderLevel: item.reorderLevel
    })),
    recentSales: recentSales.map(sale => ({
      invoice: sale.invoice,
      total: sale.total,
      datetime: sale.datetime,
      salesperson: sale.user.name,
      branch: sale.branch.name
    })),
    branchSales: role === Role.ADMIN ? await getBranchSalesWithNames(branchSales, tenantId) : []
  };
};

// Helper function to get branch names for branch sales
async function getBranchSalesWithNames(branchSales: any[], tenantId: string) {
  if (!branchSales.length) return [];
  
  const branchIds = branchSales.map(item => item.branchId);
  const branches = await prisma.branch.findMany({
    where: { id: { in: branchIds }, tenantId },
    select: { id: true, name: true }
  });

  return branchSales.map(item => {
    const branch = branches.find(b => b.id === item.branchId);
    return {
      branchName: branch?.name || 'Unknown',
      total: item._sum.total || 0,
      count: item._count || 0
    };
  });
}