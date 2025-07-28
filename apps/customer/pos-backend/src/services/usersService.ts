import { PrismaClient, Prisma, User, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserContextPayload } from '../types/custom';

const prisma = new PrismaClient();

// List users, scoped by the requesting user's role and branch
export const listUsers = async (requestingUser: UserContextPayload): Promise<User[]> => {
  const whereClause: Prisma.UserWhereInput = {
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  // If the user is a Manager, they can only see users from their own branch.
  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }
  // Admins have no extra branch filter, so they see all users in the tenant.

  return prisma.user.findMany({
    where: whereClause,
    include: { branch: true },
    orderBy: { name: 'asc' },
  });
};

// Get a single user, respecting branch scope for Managers
export const getUserById = async (id: number, requestingUser: UserContextPayload): Promise<User | null> => {
  const whereClause: Prisma.UserWhereInput = {
    id,
    tenantId: requestingUser.tenantId,
    deleted: false,
  };

  if (requestingUser.role === Role.MANAGER) {
    whereClause.branchId = requestingUser.branchId;
  }

  return prisma.user.findFirst({
    where: whereClause,
  });
};

// Create a new user
export const createUser = async (data: Prisma.UserUncheckedCreateInput, requestingUser: UserContextPayload): Promise<User> => {
  const { name, email, password, role } = data;
  let { branchId } = data;
  
  if (!password) {
      throw new Error("Password is required to create a user.");
  }
  
  // RBAC LOGIC: If a Manager creates a user, force the new user to be in the Manager's branch.
  if (requestingUser.role === Role.MANAGER) {
    branchId = requestingUser.branchId;
  }
  
  if (!branchId) {
    throw new Error("Branch ID is required to create a user.");
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      branchId,
      tenantId: requestingUser.tenantId,
      createdById: requestingUser.id,
    },
  });
};

// Update a user's details
export const updateUser = async (id: number, data: Prisma.UserUpdateInput, requestingUser: UserContextPayload): Promise<User | null> => {
  // First, verify the user being updated is within the manager's scope by attempting to fetch them
  const userToUpdate = await getUserById(id, requestingUser);
  if (!userToUpdate) {
      throw new Error("User not found or you do not have permission to edit this user.");
  }

  if (data.password) {
    data.password = await bcrypt.hash(String(data.password), 10);
  }

  await prisma.user.updateMany({
    where: { id, tenantId: requestingUser.tenantId }, // Use the id from the verified user
    data,
  });
  
  return getUserById(id, requestingUser);
};

// Soft delete a user
export const deleteUser = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
  // First, verify the user being deleted is within the manager's scope
  const userToDelete = await getUserById(id, requestingUser);
  if (!userToDelete) {
      throw new Error("User not found or you do not have permission to delete this user.");
  }

  return prisma.user.updateMany({
    where: { id, tenantId: requestingUser.tenantId },
    data: { deleted: true },
  });
};