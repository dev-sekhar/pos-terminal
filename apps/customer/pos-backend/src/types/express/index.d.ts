import { Request } from 'express';
import { Role } from '@prisma/client';

interface JwtPayload {
  id: number; // User ID is a number
  tenantId: string; // <-- MUST BE A STRING
  role: Role;
  branchId: number;
}

interface TenantInfo {
  id: string; // <-- MUST BE A STRING
  subdomain: string;
}

// Use declaration merging to add our custom properties to the global Express Request
declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
      tenant?: TenantInfo;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  tenant: TenantInfo;
}