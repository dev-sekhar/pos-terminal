import { PrismaClient, Prisma, Role } from '@prisma/client';
import { getSettings } from './settingsService';
import { UserContextPayload } from '../types/custom'; // 1. IMPORT THE CORRECT TYPE

const prisma = new PrismaClient();

const saleWithItemsAndProducts = Prisma.validator<Prisma.SaleDefaultArgs>()({
  include: { items: { include: { product: true } } },
});
type SaleWithProductItems = Prisma.SaleGetPayload<typeof saleWithItemsAndProducts>;

const calculateSaleValue = (sale: SaleWithProductItems): number => {
  if (!sale || !Array.isArray(sale.items)) return 0;
  return sale.items.reduce((total, item) => {
    const itemValue = (item.quantity || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
    return total + itemValue;
  }, 0);
};

// 2. UPDATE THE FUNCTION SIGNATURE to use the UserContextPayload
export const getDashboardMetrics = async (requestingUser: UserContextPayload) => {
  const { tenantId, role, branchId } = requestingUser;
  
  // The getSettings service now also needs to be updated to accept the payload
  const settings = await getSettings(requestingUser);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  // --- THIS IS THE RBAC LOGIC ---
  // Create a base 'where' clause that can be modified
  const salesWhereClause: Prisma.SaleWhereInput = {
      tenantId,
      deleted: false,
  };
  // If the user is a Manager, add a branch filter to all queries
  if (role === Role.MANAGER) {
      salesWhereClause.branchId = branchId;
  }
  // --- END RBAC LOGIC ---

  const includeClause = { items: { include: { product: true } } };

  const salesToday = await prisma.sale.findMany({
    where: { ...salesWhereClause, createdAt: { gte: startOfToday } },
    include: includeClause,
  });
  
  const salesThisMonth = await prisma.sale.findMany({
    where: { ...salesWhereClause, createdAt: { gte: startOfMonth } },
    include: includeClause,
  });
  
  const salesThisYear = await prisma.sale.findMany({
    where: { ...salesWhereClause, createdAt: { gte: startOfYear } },
    include: includeClause,
  });

  const totalToday = salesToday.reduce((sum, sale) => sum + calculateSaleValue(sale), 0);

  const mtdSalesByDay: Record<string, number> = {};
  salesThisMonth.forEach(sale => {
    const day = sale.createdAt.getDate().toString().padStart(2, '0');
    mtdSalesByDay[day] = (mtdSalesByDay[day] || 0) + calculateSaleValue(sale);
  });
  const mtdData = Object.entries(mtdSalesByDay).map(([date, sales]) => ({ date, sales }));

  const ytdSalesByMonth: Record<string, number> = {};
  salesThisYear.forEach(sale => {
    const month = sale.createdAt.toISOString().slice(0, 7);
    ytdSalesByMonth[month] = (ytdSalesByMonth[month] || 0) + calculateSaleValue(sale);
  });
  const fytdData = Object.entries(ytdSalesByMonth).map(([month, sales]) => ({ month, sales }));

  const getTopProducts = (sales: SaleWithProductItems[]) => {
    const productMap = new Map<string, number>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.product.name;
        const value = (item.quantity || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
        productMap.set(productName, (productMap.get(productName) || 0) + value);
      });
    });
    return Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value: value.toFixed(2) }));
  };

  return {
    totalToday,
    mtdData,
    fytdData,
    topToday: getTopProducts(salesToday),
    topMonth: getTopProducts(salesThisMonth),
    topYear: getTopProducts(salesThisYear),
    currency: settings.currency,
  };
};