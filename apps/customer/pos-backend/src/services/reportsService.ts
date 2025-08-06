import { Prisma, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma';

export const generateReports = async (requestingUser: UserContextPayload) => {
  const { tenantId, role, branchId } = requestingUser;

  // This `where` clause will be used for all queries to scope them correctly.
  const scopeWhereClause: Prisma.SaleWhereInput = {
    tenantId: tenantId,
    deleted: false,
  };

  // --- THIS IS THE CRITICAL BUSINESS LOGIC ---
  // If the user is a MANAGER, scope all queries to their specific branch.
  // If they are an ADMIN, no branch filter is added.
  if (role === Role.MANAGER) {
    scopeWhereClause.branchId = branchId;
  }

  // Example report: Total Sales Today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const salesToday = await prisma.sale.aggregate({
    _sum: { total: true },
    where: {
      ...scopeWhereClause,
      datetime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Example report: Low Stock Items
  const lowStockItems = await prisma.inventory.count({
    where: {
      // Inventory is already scoped to the manager's branch in its own service,
      // but for consistency, we can scope it here too.
      tenantId: tenantId,
      branchId: role === Role.MANAGER ? branchId : undefined,
      stock: {
        lt: prisma.inventory.fields.reorderLevel,
      },
    },
  });

  // Return a structured report object
  return {
    totalSalesToday: salesToday._sum.total || 0,
    lowStockItemCount: lowStockItems,
    // You can add more report queries here...
  };
};