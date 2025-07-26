import { PrismaClient, Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// List all non-deleted users for a tenant, including their branch
export const listUsers = async (tenantId: string): Promise<User[]> => {
  return prisma.user.findMany({
    where: { tenantId, deleted: false },
    include: { branch: true }, // Include branch information
    orderBy: { name: 'asc' },
  });
};

// Get a single user by their ID
export const getUserById = async (id: number, tenantId: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: { id, tenantId, deleted: false },
  });
};

// Create a new user with a hashed password
export const createUser = async (data: Prisma.UserUncheckedCreateInput, tenantId: string, createdById: number): Promise<User> => {
  const { name, email, password, role, branchId } = data;
  
  if (!password) {
      throw new Error("Password is required to create a user.");
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(String(password), 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      branchId,
      tenantId,
      createdById,
    },
  });
};

// Update a user's details
export const updateUser = async (id: number, data: Prisma.UserUpdateInput, tenantId: string): Promise<User | null> => {
  // If the password is being updated, it must be re-hashed
  if (data.password) {
    data.password = await bcrypt.hash(String(data.password), 10);
  }

  // First, perform the update
  await prisma.user.updateMany({
    where: { id, tenantId },
    data,
  });
  
  // Then, fetch the updated user to return it
  return getUserById(id, tenantId);
};

// Soft delete a user
export const deleteUser = async (id: number, tenantId: string): Promise<{ count: number }> => {
  // This function now correctly returns the BatchPayload, which contains a 'count'
  return prisma.user.updateMany({
    where: { id, tenantId },
    data: { deleted: true },
  });
};