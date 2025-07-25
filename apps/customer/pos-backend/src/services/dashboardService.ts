import { PrismaClient, Prisma, Product } from '@prisma/client';

const prisma = new PrismaClient();

// --- Define a precise type for our sales data using Prisma's utility ---
// This creates a type that includes the Sale and its related Items with Products
const saleWithItemsAndProducts = Prisma.validator<Prisma.SaleDefaultArgs>()({
  include: { items: { include: { product: true } } },
});
type SaleWithProductItems = Prisma.SaleGetPayload<typeof saleWithItemsAndProducts>;


// Helper to calculate the total value of a sale
const calculateSaleValue = (sale: SaleWithProductItems): number => {
  if (!sale || !Array.isArray(sale.items)) return 0;
  return sale.items.reduce((total, item) => {
    const itemValue = (item.quantity || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
    return total + itemValue;
  }, 0);
};


// Main service function to get all dashboard metrics
export const getDashboardMetrics = async (tenantId: string) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const includeClause = { items: { include: { product: true } } };

  const salesToday = await prisma.sale.findMany({ where: { tenantId, createdAt: { gte: startOfToday } }, include: includeClause });
  const salesThisMonth = await prisma.sale.findMany({ where: { tenantId, createdAt: { gte: startOfMonth } }, include: includeClause });
  const salesThisYear = await prisma.sale.findMany({ where: { tenantId, createdAt: { gte: startOfYear } }, include: includeClause });
  
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

  const topToday = getTopProducts(salesToday);
  const topMonth = getTopProducts(salesThisMonth);
  const topYear = getTopProducts(salesThisYear);
  
  const currency = 'USD';

  return { totalToday, mtdData, fytdData, topToday, topMonth, topYear, currency };
};