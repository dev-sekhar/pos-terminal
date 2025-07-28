import { Request, Response, NextFunction } from 'express';
import * as tenantsService from '../services/tenantsService';
import { UserContextPayload } from '../types/custom';
import { Role } from '@prisma/client';

const getUserFromRequest = (req: Request): UserContextPayload => {
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

export const listTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const tenants = await tenantsService.listTenants(requestingUser);
    res.json(tenants);
  } catch (err) {
    next(err);
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const tenant = await tenantsService.createTenant(req.body, requestingUser);
    res.status(201).json(tenant);
  } catch (err) {
    next(err);
  }
};

export const getTenantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const tenant = await tenantsService.getTenantById(req.params.id, requestingUser);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    const tenant = await tenantsService.updateTenant(req.params.id, req.body, requestingUser);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = getUserFromRequest(req);
    await tenantsService.deleteTenant(req.params.id, requestingUser);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};