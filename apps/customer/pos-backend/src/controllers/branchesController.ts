import { Request, Response, NextFunction } from 'express';
import * as branchesService from '../services/branchesService';

// Securely gets the tenantId from the request object (attached by middleware)
const getTenantId = (req: Request): string => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        throw new Error('Tenant ID is missing from the request session.');
    }
    return tenantId;
};

export const listBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const branches = await branchesService.listBranches(tenantId);
    res.json(branches);
  } catch (err) {
    next(err);
  }
};

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    // createdById should also come from the JWT via middleware in a real app
    const branch = await branchesService.createBranch(req.body, tenantId);
    res.status(201).json(branch);
  } catch (err) {
    next(err);
  }
};

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const branch = await branchesService.getBranchById(Number(req.params.id), tenantId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const branch = await branchesService.updateBranch(Number(req.params.id), req.body, tenantId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await branchesService.deleteBranch(Number(req.params.id), tenantId);
    res.status(204).send(); // 204 No Content is standard for a successful delete
  } catch (err) {
    next(err);
  }
};