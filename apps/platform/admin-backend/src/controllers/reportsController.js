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
