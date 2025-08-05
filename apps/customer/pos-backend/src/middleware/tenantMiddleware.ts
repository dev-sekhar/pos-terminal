import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export default async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.tenantId) {
    return res.status(401).json({ message: 'Tenant context could not be determined from user session.' });
  }

  try {
    // This will now work correctly.
    // req.user.tenantId is a STRING, which matches the schema for Tenant's 'id' field.
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: req.user.tenantId, 
      },
    });

    if (!tenant) {
      return res.status(403).json({ message: 'Forbidden: Tenant specified in token not found.' });
    }

    // This will also work correctly.
    // tenant.id is a STRING, which matches our updated TenantInfo type.
    req.tenant = {
      id: tenant.id,
      subdomain: tenant.subdomain,
    };

    next();
  } catch (error) {
    console.error("Error in tenant middleware:", error);
    return res.status(500).json({ message: "Error validating tenant." });
  }
}