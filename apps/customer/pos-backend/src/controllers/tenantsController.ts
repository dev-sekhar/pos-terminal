import { Request, Response, NextFunction } from 'express';
import * as tenantsService from '../services/tenantsService';

export const listTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenants = await tenantsService.listTenants();
    res.json(tenants);
  } catch (err) {
    next(err);
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantsService.createTenant(req.body);
    res.status(201).json(tenant);
  } catch (err) {
    next(err);
  }
};

export const getTenantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantsService.getTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantsService.updateTenant(req.params.id, req.body);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantsService.deleteTenant(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ message: 'Tenant deleted' });
  } catch (err) {
    next(err);
  }
}; 