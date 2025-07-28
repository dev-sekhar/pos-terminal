import { Role } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        tenantId: string;
        role: Role;
        branchId: number;
      };
      tenant?: {
        id: string;
      };
    }
  }
}
