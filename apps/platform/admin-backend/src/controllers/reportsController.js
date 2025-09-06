import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get sales overview
// @route   GET /api/reports/sales
// @access  Private
export const getSalesOverview = async (req, res) => {
  console.log('GET /api/reports/sales', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.datetime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        datetime: true,
        total: true,
      },
    });

    const salesByMonth = sales.reduce((acc, sale) => {
      const month = new Date(sale.datetime).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += sale.total;
      return acc;
    }, {});

    const salesData = Object.keys(salesByMonth).map(month => ({
      name: month,
      sales: salesByMonth[month],
    }));

    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    res.status(500).json({ message: 'Failed to fetch sales overview' });
  }
};

// @desc    Get top selling products
// @route   GET /api/reports/top-products
// @access  Private
export const getTopProducts = async (req, res) => {
  console.log('GET /api/reports/top-products', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.sale = {
        datetime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: topProducts.map(p => p.productId),
        },
      },
    });

    const topProductsData = topProducts.map(p => {
      const product = products.find(prod => prod.id === p.productId);
      return {
        name: product.name,
        sales: p._sum.quantity,
      };
    });

    res.json(topProductsData);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Failed to fetch top products' });
  }
};

// @desc    Get sales by category
// @route   GET /api/reports/sales-by-category
// @access  Private
export const getSalesByCategory = async (req, res) => {
  console.log('GET /api/reports/sales-by-category', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.sale = {
        datetime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const saleItems = await prisma.saleItem.findMany({
        where,
        include: {
            product: {
                include: {
                    productCategory: true
                }
            }
        }
    });

    const salesByCategory = saleItems.reduce((acc, item) => {
        const categoryName = item.product.productCategory.name;
        const categoryValue = item.price * item.quantity;
        const existingCategory = acc.find(c => c.name === categoryName);
        if (existingCategory) {
            existingCategory.value += categoryValue;
        } else {
            acc.push({ name: categoryName, value: categoryValue });
        }
        return acc;
    }, []);

    res.json(salesByCategory);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Failed to fetch sales by category' });
  }
};

// @desc    Get tenant growth and activity
// @route   GET /api/reports/tenant-growth
// @access  Private
export const getTenantGrowth = async (req, res) => {
  console.log('GET /api/reports/tenant-growth', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      select: {
        createdAt: true,
        active: true,
      },
    });

    const tenantGrowth = tenants.reduce((acc, tenant) => {
      const month = new Date(tenant.createdAt).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { new: 0, active: 0 };
      }
      acc[month].new++;
      if (tenant.active) {
        acc[month].active++;
      }
      return acc;
    }, {});

    const tenantGrowthData = Object.keys(tenantGrowth).map(month => ({
      name: month,
      newTenants: tenantGrowth[month].new,
      activeTenants: tenantGrowth[month].active,
    }));

    res.json(tenantGrowthData);
  } catch (error) {
    console.error('Error fetching tenant growth:', error);
    res.status(500).json({ message: 'Failed to fetch tenant growth' });
  }
};

// @desc    Get tenant engagement
// @route   GET /api/reports/tenant-engagement
// @access  Private
export const getTenantEngagement = async (req, res) => {
  console.log('GET /api/reports/tenant-engagement', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.datetime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        tenantId: true,
      },
    });

    const tenants = await prisma.tenant.findMany({
        select: {
            id: true,
            name: true
        }
    });

    const tenantEngagement = tenants.map(tenant => {
        const transactionCount = sales.filter(sale => sale.tenantId === tenant.id).length;
        return {
            name: tenant.name,
            transactions: transactionCount
        }
    });

    res.json(tenantEngagement);
  } catch (error) {
    console.error('Error fetching tenant engagement:', error);
    res.status(500).json({ message: 'Failed to fetch tenant engagement' });
  }
};

// @desc    Get MRR
// @route   GET /api/reports/mrr
// @access  Private
export const getMrr = async (req, res) => {
  console.log('GET /api/reports/mrr', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        pricingPlan: true,
      },
    });

    const mrrByPlan = tenants.reduce((acc, tenant) => {
      if (tenant.pricingPlan) {
        const planName = tenant.pricingPlan.name;
        const price = tenant.pricingPlan.price || 0;
        if (!acc[planName]) {
          acc[planName] = 0;
        }
        acc[planName] += price;
      }
      return acc;
    }, {});

    const mrrData = Object.keys(mrrByPlan).map(planName => ({
      name: planName,
      mrr: mrrByPlan[planName],
    }));

    res.json(mrrData);
  } catch (error) {
    console.error('Error fetching MRR:', error);
    res.status(500).json({ message: 'Failed to fetch MRR' });
  }
};

// @desc    Get outstanding payments
// @route   GET /api/reports/outstanding-payments
// @access  Private
export const getOutstandingPayments = async (req, res) => {
  console.log('GET /api/reports/outstanding-payments', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        ...where,
      },
      include: {
        tenant: true,
        payments: true,
      },
    });

    const outstandingPayments = invoices.map(invoice => ({
      tenant: invoice.tenant.name,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
      paid: invoice.payments.reduce((acc, p) => acc + p.amount, 0),
    }));

    res.json(outstandingPayments);
  } catch (error) {
    console.error('Error fetching outstanding payments:', error);
    res.status(500).json({ message: 'Failed to fetch outstanding payments' });
  }
};

// @desc    Get plan changes
// @route   GET /api/reports/plan-changes
// @access  Private
export const getPlanChanges = async (req, res) => {
  console.log('GET /api/reports/plan-changes', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const planChanges = await prisma.auditLog.findMany({
      where: {
        action: 'Plan Changed',
        ...where,
      },
      include: {
        tenant: true,
      },
    });

    const planChangesData = planChanges.map(log => ({
      tenant: log.tenant.name,
      fromPlan: log.details.fromPlan,
      toPlan: log.details.toPlan,
      date: log.createdAt,
    }));

    res.json(planChangesData);
  } catch (error) {
    console.error('Error fetching plan changes:', error);
    res.status(500).json({ message: 'Failed to fetch plan changes' });
  }
};

// @desc    Get sales volume
// @route   GET /api/reports/sales-volume
// @access  Private
export const getSalesVolume = async (req, res) => {
  console.log('GET /api/reports/sales-volume', req.query);
  try {
    const { startDate, endDate, period } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.datetime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        datetime: true,
        total: true,
      },
    });

    const salesVolume = sales.reduce((acc, sale) => {
      let key;
      if (period === 'daily') {
        key = new Date(sale.datetime).toLocaleDateString();
      } else if (period === 'weekly') {
        const date = new Date(sale.datetime);
        const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
        key = firstDay.toLocaleDateString();
      } else {
        key = new Date(sale.datetime).toLocaleString('default', { month: 'short' });
      }

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += sale.total;
      return acc;
    }, {});

    const salesVolumeData = Object.keys(salesVolume).map(key => ({
      name: key,
      sales: salesVolume[key],
    }));

    res.json(salesVolumeData);
  } catch (error) {
    console.error('Error fetching sales volume:', error);
    res.status(500).json({ message: 'Failed to fetch sales volume' });
  }
};

// @desc    Get transactions per tenant
// @route   GET /api/reports/transactions-per-tenant
// @access  Private
export const getTransactionsPerTenant = async (req, res) => {
  console.log('GET /api/reports/transactions-per-tenant', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.datetime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await prisma.sale.groupBy({
      by: ['tenantId'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    const tenants = await prisma.tenant.findMany({
      where: {
        id: {
          in: sales.map(s => s.tenantId),
        },
      },
    });

    const transactionsPerTenantData = sales.map(s => {
      const tenant = tenants.find(t => t.id === s.tenantId);
      return {
        name: tenant.name,
        transactions: s._count.id,
        value: s._sum.total,
      };
    });

    res.json(transactionsPerTenantData);
  } catch (error) {
    console.error('Error fetching transactions per tenant:', error);
    res.status(500).json({ message: 'Failed to fetch transactions per tenant' });
  }
};

// @desc    Get top selling products across tenants
// @route   GET /api/reports/top-selling-products-across-tenants
// @access  Private
export const getTopSellingProductsAcrossTenants = async (req, res) => {
  console.log('GET /api/reports/top-selling-products-across-tenants', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.sale = {
        datetime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: topProducts.map(p => p.productId),
        },
      },
    });

    const topProductsData = topProducts.map(p => {
      const product = products.find(prod => prod.id === p.productId);
      return {
        name: product.name,
        sales: p._sum.quantity,
      };
    });

    res.json(topProductsData);
  } catch (error) {
    console.error('Error fetching top selling products across tenants:', error);
    res.status(500).json({ message: 'Failed to fetch top selling products across tenants' });
  }
};

// @desc    Get refunds
// @route   GET /api/reports/refunds
// @access  Private
export const getRefunds = async (req, res) => {
  console.log('GET /api/reports/refunds', req.query);
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.datetime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const refunds = await prisma.sale.findMany({
      where: {
        status: 'refunded',
        ...where,
      },
      include: {
        tenant: true,
      },
    });

    const refundsData = refunds.map(refund => ({
      tenant: refund.tenant.name,
      amount: refund.total,
      date: refund.datetime,
    }));

    res.json(refundsData);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ message: 'Failed to fetch refunds' });
  }
};
