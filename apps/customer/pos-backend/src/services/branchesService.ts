import { PrismaClient, Prisma, User, Role, Branch } from '@prisma/client';

const prisma = new PrismaClient();

// List branches, scoped by the requesting user's role and branch
export const listBranches = async (requestingUser: User): Promise<Branch[]> => {
  const whereClause: Prisma.BranchWhereInput = {
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.id = requestingUser.branchId;
  }

  return prisma.branch.findMany({
    where: whereClause,
    orderBy: { name: 'asc' },
  });
};

// Create a new branch (Admin only)
export const createBranch = async (data: Prisma.BranchUncheckedCreateInput, requestingUser: User): Promise<Branch> => {
  if (requestingUser.role !== Role.ADMIN) {
    throw new Error('Forbidden: Only Administrators can create new branches.');
  }
  const { name, tag, location, active } = data;
  return prisma.branch.create({
    data: {
      name,
      tag,
      location,
      active,
      tenantId: requestingUser.tenantId,
      createdById: requestingUser.id,
    },
  });
};

// Get a single branch, respecting branch scope for Managers
export const getBranchById = async (id: number, requestingUser: User): Promise<Branch | null> => {
  const whereClause: Prisma.BranchWhereInput = {
    id,
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.id = requestingUser.branchId;
  }

  return prisma.branch.findFirst({ where: whereClause });
};

// Update a branch, respecting branch scope for Managers
export const updateBranch = async (id: number, data: Prisma.BranchUpdateInput, requestingUser: User): Promise<Branch | null> => {
  const branchToUpdate = await getBranchById(id, requestingUser);
  if (!branchToUpdate) {
    throw new Error("Branch not found or you do not have permission to edit it.");
  }
  
  if (data.active === false) {
    const mainBranch = await prisma.branch.findFirst({
      where: { tenantId: requestingUser.tenantId, tag: 'Main' }
    });
    if (!mainBranch) throw new Error("Cannot deactivate branch: 'Main' branch not found.");
    if (mainBranch.id === id) throw new Error("'Main' branch cannot be deactivated.");
    
    await prisma.$transaction(async (tx) => {
      await tx.inventory.updateMany({
        where: { tenantId: requestingUser.tenantId, branchId: id },
        data: { branchId: mainBranch.id }
      });
      await tx.branch.update({ where: { id }, data });
    });
    return getBranchById(id, requestingUser);
  }
  
  await prisma.branch.updateMany({ where: { id, tenantId: requestingUser.tenantId }, data });
  return getBranchById(id, requestingUser);
};

// --- THIS IS THE FIX ---
// Soft delete a branch
// The function signature is corrected to return Promise<{ count: number }>
export const deleteBranch = async (id: number, requestingUser: User): Promise<{ count: number }> => {
  const branchToDelete = await getBranchById(id, requestingUser);
  if (!branchToDelete) {
    return { count: 0 }; // Return a count of 0 if nothing was found to delete
  }
  // The result of updateMany, which is { count: number }, is now correctly returned
  return prisma.branch.updateMany({
    where: { id: branchToDelete.id, tenantId: requestingUser.tenantId },
    data: { deleted: true },
  });
};