import { Role } from '@prisma/client';

// This is the single source of truth for the shape of our user context object.
// It contains only the data available from the JWT.
export interface UserContextPayload {
  id: number;
  tenantId: string;
  role: Role;
  branchId: number;
}