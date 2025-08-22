import { PrismaClient, Prisma, User, Role } from '@prisma/client';
import { UserContextPayload } from '../types/custom';
import prisma from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import { PricingPlanEnforcer } from './planLimitService';

// List users, securely scoped by the requesting user's role and branch
export const listUsers = async (requestingUser: UserContextPayload): Promise<User[]> => {
  const { tenantId, role, branchId } = requestingUser;
  const whereClause: Prisma.UserWhereInput = {
    tenantId: tenantId,
    deleted: false,
  };

  // Managers can only see users in their own branch.
  if (role === Role.MANAGER) {
    whereClause.branchId = branchId;
  }
  // Admins see all users in the tenant.

  return prisma.user.findMany({
    where: whereClause,
    include: { branch: true },
    orderBy: { name: 'asc' },
  });
};

// Get a single user by ID, respecting branch scope for Managers
export const getUserById = async (id: number, requestingUser: UserContextPayload): Promise<User | null> => {
    const { tenantId, role, branchId } = requestingUser;
    
    // Admins can get any user in the tenant
    const whereClause: Prisma.UserWhereUniqueInput = { id, tenantId };
    
    const user = await prisma.user.findUnique({ where: whereClause });

    // If the requester is a Manager, we must verify the found user is in their branch.
    if (!user || (role === Role.MANAGER && user.branchId !== branchId)) {
        return null;
    }

    return user;
};

// Create a new user, respecting branch scope for Managers
export const createUser = async (data: any, requestingUser: UserContextPayload): Promise<User> => {
  // Filter out userName and other invalid fields
  const { name, email, password, role, branchId } = data;
  const { tenantId, role: requesterRole, branchId: requesterBranchId, id: creatorId } = requestingUser;

  // Check plan limits before creating user
  await PricingPlanEnforcer.enforceLimit(tenantId, 'users');

  let finalBranchId = branchId;

  // A Manager can ONLY create users for their own branch.
  // They also cannot create other ADMINs.
  if (requesterRole === Role.MANAGER) {
    if (role === Role.ADMIN) {
      throw new Error("Forbidden: Managers cannot create Admin users.");
    }
    finalBranchId = requesterBranchId; // Force the user to be created in the manager's branch.
  }

  if (!finalBranchId) throw new Error("Branch is required to create a user.");
  
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      branchId: finalBranchId,
      tenantId: tenantId,
      createdById: creatorId,
    },
  });
};

// Update a user, respecting branch scope for Managers
export const updateUser = async (id: number, data: any, requestingUser: UserContextPayload): Promise<User | null> => {
    // Filter out userName and other invalid fields
    const { name, email, password, role, branchId } = data;
    const { tenantId, role: requesterRole, branchId: requesterBranchId } = requestingUser;
    
    // First, find the user being updated to verify ownership.
    const userToUpdate = await prisma.user.findUnique({ where: { id, tenantId }});
    if (!userToUpdate) {
        return null; // User doesn't exist in this tenant
    }

    // A Manager can only edit users in their own branch.
    if (requesterRole === Role.MANAGER && userToUpdate.branchId !== requesterBranchId) {
        throw new Error("Forbidden: You can only edit users in your own branch.");
    }
    
    // A Manager cannot promote a user to ADMIN or edit an existing ADMIN.
    if (requesterRole === Role.MANAGER && (role === Role.ADMIN || userToUpdate.role === Role.ADMIN)) {
        throw new Error("Forbidden: Managers cannot edit or create Admin users.");
    }

    // Start building the data object for the update operation
    const updateData: Prisma.UserUpdateInput = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // --- THIS IS THE CRITICAL FIX ---
    // For the branch relation, we must use the 'connect' syntax.
    if (branchId) {
        updateData.branch = {
            connect: { id: Number(branchId) }
        };
    }

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    return prisma.user.update({
        where: { id },
        data: updateData
    });
};

// Soft delete a user, respecting branch scope for Managers
export const deleteUser = async (id: number, requestingUser: UserContextPayload): Promise<{ count: number }> => {
    const { tenantId, role, branchId } = requestingUser;
    
    const whereClause: Prisma.UserWhereInput = { id, tenantId };

    // A Manager can only delete users in their own branch.
    if (role === Role.MANAGER) {
        whereClause.branchId = branchId;
    }
    
    // Ensure the user exists and meets the criteria before trying to delete.
    const userToDelete = await prisma.user.findFirst({ where: whereClause });
    // Prevent deleting admins and ensure user exists.
    if (!userToDelete || userToDelete.role === Role.ADMIN) {
        return { count: 0 };
    }

    return prisma.user.updateMany({
        where: { id: userToDelete.id },
        data: { deleted: true }
    });
};