import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as branchesService from '../services/branchesService';
import prisma from '../lib/prisma';

/**
 * Creates the full user context payload that the branchesService expects.
 * It fetches the full user record from the database using the ID from the JWT,
 * and crucially, overrides the tenantId with the tenant's correct DATABASE ID.
 * @param req The authenticated request object.
 * @returns The full user object with the correct tenantId database ID.
 */
const createFullUserContext = async (req: AuthenticatedRequest) => {
    const fullUser = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!fullUser) {
        throw new Error("Authenticated user not found in database.");
    }

    // This is the critical fix: use the tenant's database ID from the tenant middleware.
    return {
        ...fullUser,
        tenantId: req.tenant.id
    };
};


export const listBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = await createFullUserContext(req as AuthenticatedRequest);
    const branches = await branchesService.listBranches(context);
    res.json(branches);
  } catch (err) {
    next(err);
  }
};

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = await createFullUserContext(req as AuthenticatedRequest);
    const branch = await branchesService.createBranch(req.body, context);
    res.status(201).json(branch);
  } catch (err: any) {
    if (err.message && err.message.includes('limit exceeded')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = await createFullUserContext(req as AuthenticatedRequest);
    const branch = await branchesService.getBranchById(Number(req.params.id), context);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = await createFullUserContext(req as AuthenticatedRequest);
    const branch = await branchesService.updateBranch(Number(req.params.id), req.body, context);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = await createFullUserContext(req as AuthenticatedRequest);
    const result = await branchesService.deleteBranch(Number(req.params.id), context);
    if (result.count === 0) {
      return res.status(404).json({ message: 'Branch not found or you do not have permission to delete it' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// --- PRESERVED AND CORRECT getMyBranch function ---
export const getMyBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const branchId = authReq.user.branchId;

    const branch = await prisma.branch.findUnique({
      where: {
        id: branchId,
        // Ensure the branch belongs to the authenticated tenant.
        tenantId: authReq.tenant.id 
      }
    });

    if (!branch) {
      return res.status(404).json({ message: "Assigned branch not found." });
    }
    
    res.json(branch);
  } catch (err: any) {
    next(err);
  }
};