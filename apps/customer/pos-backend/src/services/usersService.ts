import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

export const listUsers = async (tenantId: string): Promise<User[]> => {
  return prisma.user.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
};

export const createUser = async (data: any, tenantId: string, createdById: number): Promise<User> => {
  return prisma.user.create({
    data: {
      ...data,
      tenantId,
      createdById,
    },
  });
};

export const getUserById = async (id: number, tenantId: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: { id, tenantId },
  });
};

export const updateUser = async (id: number, data: any, tenantId: string): Promise<User | null> => {
  return prisma.user.update({
    where: { id },
    data: { ...data, tenantId },
  });
};

export const deleteUser = async (id: number, tenantId: string): Promise<User | null> => {
  return prisma.user.delete({
    where: { id },
  });
}; 