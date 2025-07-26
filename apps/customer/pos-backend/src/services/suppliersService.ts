import { PrismaClient, Prisma, Supplier } from '@prisma/client';

const prisma = new PrismaClient();

// List all suppliers that are LINKED to a specific tenant
export const listSuppliersForTenant = async (tenantId: string): Promise<Supplier[]> => {
  const links = await prisma.tenantsOnSuppliers.findMany({
    where: { tenantId },
    include: { supplier: true },
    orderBy: { supplier: { name: 'asc' } }
  });
  // Extract just the supplier objects that are not soft-deleted
  return links
    .map(link => link.supplier)
    .filter(supplier => supplier && !supplier.deleted);
};

// This is the core "smart" function.
export const createOrLinkSupplier = async (data: Prisma.SupplierCreateInput, tenantId: string, createdById: number): Promise<Supplier> => {
  // Use a unique identifier like email or name to find existing suppliers. Name is used here.
  const { name, contact, email, address, active } = data;

  // Prisma's 'upsert' is perfect for this: create if not exists, otherwise do nothing.
  const supplier = await prisma.supplier.upsert({
    where: { name }, // Assumes supplier name is globally unique
    update: {}, // If supplier exists, we don't need to change it
    create: { // If supplier does not exist, create it in the global pool
      name,
      contact,
      email,
      address,
      active,
      createdById,
    }
  });

  // Now, link this supplier to the current tenant.
  // Use 'upsert' again to avoid errors if the link already exists.
  await prisma.tenantsOnSuppliers.upsert({
    where: { tenantId_supplierId: { tenantId, supplierId: supplier.id } },
    update: {}, // If link exists, do nothing
    create: { // If link doesn't exist, create it
      tenantId,
      supplierId: supplier.id,
      assignedBy: String(createdById),
    }
  });

  return supplier;
};

// Unlink a supplier from the current tenant. This does NOT delete the global supplier record.
export const unlinkSupplierFromTenant = async (supplierId: number, tenantId: string): Promise<void> => {
  await prisma.tenantsOnSuppliers.delete({
    where: { tenantId_supplierId: { tenantId, supplierId } }
  });
};