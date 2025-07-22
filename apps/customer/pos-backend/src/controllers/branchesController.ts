import { Request, Response, NextFunction } from 'express';
import * as branchesService from '../services/branchesService';

export const listBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const branches = await branchesService.listBranches(tenantId);
    res.json(branches);
  } catch (err) {
    next(err);
  }
};

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const createdById = req.body.createdById;
    const branch = await branchesService.createBranch(req.body, tenantId, createdById);
    res.status(201).json(branch);
  } catch (err) {
    next(err);
  }
};

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const branch = await branchesService.getBranchById(Number(req.params.id), tenantId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.body.tenantId;
    const branch = await branchesService.updateBranch(Number(req.params.id), req.body, tenantId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
};

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query.tenantId as string;
    const branch = await branchesService.deleteBranch(Number(req.params.id), tenantId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    next(err);
  }
}; 