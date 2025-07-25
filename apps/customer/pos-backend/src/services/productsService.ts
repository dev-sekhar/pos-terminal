import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// List all non-deleted products for a tenant, including their category
export const listProducts = async (tenantId: string) => {
  return prisma.product.findMany({
    where: { tenantId, deleted: false },
    include: { productCategory: true },
    orderBy: { name: 'asc' },
  });
};

// Create a new product
export const createProduct = async (data: Prisma.ProductUncheckedCreateInput, tenantId: string, createdById: number) => {
  // Destructure to ensure only expected fields are passed
  const { name, code, unit, price, productCategoryId } = data;
  
  // FIX: Ensure the price is a number before sending it to the database.
  const numericPrice = parseFloat(String(price));
  if (isNaN(numericPrice)) {
    throw new Error("Invalid price. Price must be a valid number.");
  }

  return prisma.product.create({
    data: {
      name,
      code,
      unit,
      price: numericPrice, // Use the converted numeric price
      productCategoryId,
      tenantId,
      createdById,
    },
  });
};

// Get a single product by its ID
export const getProductById = async (id: number, tenantId: string) => {
  return prisma.product.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

// Update a product
export const updateProduct = async (id: number, data: Prisma.ProductUpdateInput, tenantId: string) => {
    // Also add the fix to the update function for consistency
    if (data.price) {
        data.price = parseFloat(String(data.price));
        if (isNaN(Number(data.price))) {
            throw new Error("Invalid price. Price must be a valid number.");
        }
    }
  return prisma.product.updateMany({
    where: { id, tenantId },
    data,
  }).then(() => getProductById(id, tenantId));
};

// Soft delete a product
export const deleteProduct = async (id: number, tenantId: string) => {
  return prisma.product.updateMany({
    where: { id, tenantId },
    data: { deleted: true },
  });
};

// Generate a new, unique product code for the tenant
export const generateNewProductCode = async (tenantId: string): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `P${datePart}-`;

    const lastProduct = await prisma.product.findFirst({
        where: { tenantId, code: { startsWith: prefix } },
        orderBy: { code: 'desc' },
    });

    let nextNum = 1;
    if (lastProduct) {
        const lastNum = parseInt(lastProduct.code.split('-')[1], 10);
        nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

// Bulk create products from a CSV import
export const importProductsFromCSV = async (products: Prisma.ProductUncheckedCreateInput[], tenantId: string, createdById: number) => {
    const productsToCreate = products.map(p => ({
        ...p,
        price: parseFloat(String(p.price)), // Ensure price is a number here too
        tenantId,
        createdById,
    }));
    return prisma.product.createMany({
        data: productsToCreate,
        skipDuplicates: true,
    });
};