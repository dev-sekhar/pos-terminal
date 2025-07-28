import { Request, Response, NextFunction } from 'express';
import * as branchesService from '../services/branchesService';
import { User, Role } from '@prisma/client';

const getUserFromRequest = (req: Request): { id: number; tenantId: string; role: Role; branchId: number; } => {
    const user = req.user;
    if (!user) {
        throw new Error('User context is missing from the request session.');
    }
    return {
        id: Number(user.id),
        tenantId: user.tenantId,
        role: user.role,
        branchId: user.branchId,
    };
};

export const listBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const branches = await branchesService.listBranches(requestingUser as User);
    res.json(branches);
  } catch (err) { next(err); }
};

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    // --- THIS IS THE FIX ---
    // We now pass the form data (req.body) as the first argument
    // and the user object as the second, matching the service's definition.
    const branch = await branchesService.createBranch(req.body, requestingUser as User);
    res.status(201).json(branch);
  } catch (err) { next(err); }
};

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const branch = await branchesService.getBranchById(Number(req.params.id), requestingUser as User);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const branch = await branchesService.updateBranch(Number(req.params.id), req.body, requestingUser as User);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const result = await branchesService.deleteBranch(Number(req.params.id), requestingUser as User);
    if (result.count === 0) {
      return res.status(404).json({ message: 'Branch not found or you do not have permission to delete it' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};