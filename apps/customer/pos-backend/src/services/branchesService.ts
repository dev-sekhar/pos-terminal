import { PrismaClient, Branch } from '@prisma/client';
const prisma = new PrismaClient();

export const listBranches = async (tenantId: string): Promise<Branch[]> => {
  return prisma.branch.findMany({
    where: { tenantId, deleted: false },
    orderBy: { name: 'asc' },
  });
};

export const createBranch = async (data: any, tenantId: string, createdById: number): Promise<Branch> => {
  return prisma.branch.create({
    data: {
      ...data,
      tenantId,
      createdById,
      active: true,
      deleted: false,
    },
  });
};

export const getBranchById = async (id: number, tenantId: string): Promise<Branch | null> => {
  return prisma.branch.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

export const updateBranch = async (id: number, data: any, tenantId: string): Promise<Branch | null> => {
  return prisma.branch.update({
    where: { id },
    data: { ...data, tenantId },
  });
};

export const deleteBranch = async (id: number, tenantId: string): Promise<Branch | null> => {
  return prisma.branch.update({
    where: { id },
    data: { deleted: true, tenantId },
  });
}; 