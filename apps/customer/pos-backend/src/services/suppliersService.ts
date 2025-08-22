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
  const { name, contact, email, address, active } = data;

  // Check if supplier already exists by name, email, or contact
  let supplier = await prisma.supplier.findFirst({
    where: {
      OR: [
        { name },
        ...(email ? [{ email }] : []),
        ...(contact ? [{ contact }] : [])
      ]
    }
  });

  // If supplier exists with same contact or email but different name, throw error
  if (supplier && supplier.name !== name) {
    if (supplier.email === email) {
      throw new Error(`Email ${email} is already associated with supplier "${supplier.name}"`);
    }
    if (supplier.contact === contact) {
      throw new Error(`Contact ${contact} is already associated with supplier "${supplier.name}"`);
    }
  }

  // If supplier doesn't exist, create it
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name,
        contact,
        email,
        address,
        active,
        createdById,
      }
    });
  }

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

// Update a supplier (only if linked to the tenant)
export const updateSupplier = async (supplierId: number, data: Prisma.SupplierUpdateInput, tenantId: string): Promise<Supplier | null> => {
  // First check if supplier is linked to this tenant
  const link = await prisma.tenantsOnSuppliers.findUnique({
    where: { tenantId_supplierId: { tenantId, supplierId } }
  });
  
  if (!link) {
    return null; // Supplier not linked to this tenant
  }

  // Update the supplier
  return prisma.supplier.update({
    where: { id: supplierId },
    data
  });
};

// Unlink a supplier from the current tenant. This does NOT delete the global supplier record.
export const unlinkSupplierFromTenant = async (supplierId: number, tenantId: string): Promise<void> => {
  await prisma.tenantsOnSuppliers.delete({
    where: { tenantId_supplierId: { tenantId, supplierId } }
  });
};