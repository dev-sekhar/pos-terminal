import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// List all non-deleted branches for a tenant
export const listBranches = async (tenantId: string) => {
  return prisma.branch.findMany({
    where: { tenantId, deleted: false },
    orderBy: { name: 'asc' },
  });
};

// Create a new branch
export const createBranch = async (data: Prisma.BranchCreateWithoutTenantInput, tenantId: string) => {
  // Use Prisma's generated types for safety, omitting fields we set manually
  const { name, tag, location } = data;
  return prisma.branch.create({
    data: {
      name,
      tag,
      location,
      tenant: { connect: { id: tenantId } },
      // createdBy should come from the user's JWT, which can be added to the middleware
    },
  });
};

// Get a single branch by its ID for a specific tenant
export const getBranchById = async (id: number, tenantId: string) => {
  return prisma.branch.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

// Update a branch, now with the inventory transfer logic!
export const updateBranch = async (id: number, data: Prisma.BranchUpdateInput, tenantId: string) => {
  // If the branch is being deactivated...
  if (data.active === false) {
    // Find the 'Main' branch to transfer inventory to.
    const mainBranch = await prisma.branch.findFirst({
      where: { tenantId, tag: 'Main' }
    });

    if (!mainBranch) {
      throw new Error("Cannot deactivate branch: 'Main' branch not found.");
    }
    if (mainBranch.id === id) {
      throw new Error("'Main' branch cannot be deactivated.");
    }
    
    // Use a transaction to safely move inventory and then deactivate the branch
    return prisma.$transaction(async (tx) => {
      // 1. Reassign all inventory items from the old branch to the main branch.
      await tx.inventory.updateMany({
        where: { tenantId, branchId: id },
        data: { branchId: mainBranch.id }
      });

      // 2. Now, safely update the branch to be inactive.
      const updatedBranch = await tx.branch.update({
        where: { id },
        data,
      });

      return updatedBranch;
    });
  }

  // If not deactivating, just perform a normal update.
  return prisma.branch.update({
    where: { id },
    data,
  });
};

// Soft delete a branch
export const deleteBranch = async (id: number, tenantId: string) => {
  return prisma.branch.updateMany({
    where: { id, tenantId },
    data: { deleted: true },
  });
};