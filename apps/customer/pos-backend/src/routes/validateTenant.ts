import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/validate-tenant/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: { id: true, name: true, subdomain: true }
    });

    if (tenant) {
      res.json({ exists: true, tenant });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error validating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;