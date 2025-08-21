import { Prisma, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma';

import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';


interface TenantSettings {
  currency?: string;
  timezone?: string;
  tenantDisplayName?: string;
  logo?: string;
  units?: string[];
  paymentTypes?: string[];
}

export const getDashboardMetrics = async (requestingUser: UserContextPayload) => {
  const { tenantId, role, branchId } = requestingUser;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  let settings: TenantSettings = {};
  if (tenant && typeof tenant.settings === 'object' && tenant.settings !== null) {
      settings = tenant.settings as TenantSettings;
  }
  
  const tenantTimezone = settings.timezone || 'UTC';
  
  const now = new Date();
  const zonedNow = utcToZonedTime(now, tenantTimezone);

  const tenantTodayStart = startOfDay(zonedNow);
  const tenantMonthStart = startOfMonth(zonedNow);
  const tenantYearStart = startOfYear(zonedNow);

  const todayStartUTC = zonedTimeToUtc(tenantTodayStart, tenantTimezone);
  const monthStartUTC = zonedTimeToUtc(tenantMonthStart, tenantTimezone);
  const yearStartUTC = zonedTimeToUtc(tenantYearStart, tenantTimezone);

  const scopeWhereClause: Prisma.SaleWhereInput = {
    tenantId: tenantId,
    deleted: false,
  };
  if (role !== Role.ADMIN) {
    scopeWhereClause.branchId = branchId;
  }

  const [
    salesTodayData,
    salesMTDData,
    salesFYTDData,
    topProductsTodayData,
    topProductsMonthData,
    topProductsYearData
  ] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { ...scopeWhereClause, datetime: { gte: todayStartUTC } },
    }),
    prisma.sale.findMany({
      where: { ...scopeWhereClause, datetime: { gte: monthStartUTC } },
      select: { datetime: true, total: true },
      orderBy: { datetime: 'asc' }
    }),
    prisma.sale.findMany({
      where: { ...scopeWhereClause, datetime: { gte: yearStartUTC } },
      select: { datetime: true, total: true },
      orderBy: { datetime: 'asc' }
    }),
    prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { sale: { ...scopeWhereClause, datetime: { gte: todayStartUTC } } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: { sale: { ...scopeWhereClause, datetime: { gte: monthStartUTC } } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    }),
    prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: { sale: { ...scopeWhereClause, datetime: { gte: yearStartUTC } } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    }),
  ]);

  type GroupByResult = {
      productId: number;
      _sum: { quantity: number | null };
  };

  const allProductIds = [
      ...(topProductsTodayData as GroupByResult[]).map(p => p.productId),
      ...(topProductsMonthData as GroupByResult[]).map(p => p.productId),
      ...(topProductsYearData as GroupByResult[]).map(p => p.productId)
  ];
  const uniqueProductIds = [...new Set(allProductIds)];
  const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: { id: true, name: true, price: true }
  });

  const mapResults = (data: GroupByResult[]) => {
      return data.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
              name: product?.name || 'Unknown Product',
              value: (item._sum.quantity || 0) * (product?.price || 0)
          }
      }).sort((a, b) => b.value - a.value);
  }

  // Process MTD data - group by day
  const mtdData = salesMTDData.reduce((acc: any[], sale) => {
    const date = sale.datetime.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.sales += Number(sale.total);
    } else {
      acc.push({ date, sales: Number(sale.total) });
    }
    return acc;
  }, []);

  // Process FYTD data - group by month
  const fytdData = salesFYTDData.reduce((acc: any[], sale) => {
    const month = sale.datetime.toISOString().substring(0, 7);
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.sales += Number(sale.total);
    } else {
      acc.push({ month, sales: Number(sale.total) });
    }
    return acc;
  }, []);

  return {
    totalToday: salesTodayData._sum.total || 0,
    mtdData,
    fytdData,
    topToday: mapResults(topProductsTodayData),
    topMonth: mapResults(topProductsMonthData),
    topYear: mapResults(topProductsYearData),
  };
};