import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { getUserPermissions } from '@pos-terminal/permissions';
import prisma from '../lib/prisma'; // FIX 1: Use the shared prisma client
import { AuthenticatedRequest } from '../types/express'; // FIX 2: Import the AuthenticatedRequest type
import { ClientLoginResponse } from '../types/auth';
import { checkPaymentStatus } from '../middleware/paymentStatusMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  const { email, password, subdomain } = req.body;

  if (!email || !password || !subdomain) {
    return res.status(400).json({ message: 'Email, password, and subdomain are required.' });
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }
    
    if (!tenant.active) {
      return res.status(403).json({ message: 'Account suspended. Please contact support.' });
    }

    // Check payment status using new three-tier system
    const paymentStatus = await checkPaymentStatus(tenant.id);
    
    if (!paymentStatus.canLogin) {
      return res.status(403).json({ 
        message: paymentStatus.message || 'Please contact support to enable login',
        paymentStatus 
      });
    }
    
    // In our schema, the User's tenantId is a string, matching the Tenant's ID type.
    const user = await prisma.user.findFirst({ 
      where: { tenantId: tenant.id, email } 
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokenPayload = { 
      id: user.id, 
      tenantId: user.tenantId, // This is the string ID
      role: user.role,
      branchId: user.branchId 
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    const userAccessList = getUserPermissions(user.role);
    console.log(`[AUTH SUCCESS] User '${user.email}' logged in.`);
    console.log(`             ROLE: ${user.role}`);
    console.log(`             ACCESS GRANTED:`, userAccessList);

    const { password: _, ...userResponse } = user;

    // Get payment alert information
    let paymentAlert = null;
    if (paymentStatus.daysPastDue > 0) {
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          tenantId: tenant.id,
          status: { in: ['PENDING', 'OVERDUE'] },
          dueDate: { lt: new Date() }
        },
        include: { payments: true }
      });
      
      const totalOverdue = overdueInvoices.reduce((sum, invoice) => {
        const paid = invoice.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
        return sum + (invoice.amount - paid);
      }, 0);
      
      paymentAlert = {
        totalOverdue,
        daysPastDue: paymentStatus.daysPastDue,
        stage: paymentStatus.stage,
        canEdit: paymentStatus.canEdit,
        isUrgent: paymentStatus.stage !== 'normal'
      };
    }

    res.json({
      token,
      user: userResponse,
      tenant,
      paymentAlert,
      paymentStatus
    } as ClientLoginResponse);

  } catch (error) {
    console.error('[AUTH ERROR] An unexpected error occurred during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- FIX 3: A complete and secure getProfile function ---
export const getProfile = async (req: Request, res: Response) => {
  // authMiddleware has already run, so we can safely cast the type.
  const authReq = req as AuthenticatedRequest;
  
  try {
    // Fetch the user's profile from the database using the ID from the token.
    // Explicitly select fields to ensure the password is never returned.
    const userProfile = await prisma.user.findUnique({ 
      where: { id: authReq.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};