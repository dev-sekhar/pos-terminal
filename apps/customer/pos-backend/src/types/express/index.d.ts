// /src/types/express/index.d.ts

// This file uses declaration merging to add our custom properties to Express's types.
// It will be automatically included in the compilation process thanks to our tsconfig.json update.
declare namespace Express {
  export interface Request {
    // This is the decoded JWT payload, attached by authMiddleware
    user?: {
      id: string; // The user's ID (as a string from JWT, will be converted to number)
      tenantId: string; // The tenant's ID
    };
    // This is added by the tenantMiddleware
    tenant?: {
      id: string;
    };
  }
}