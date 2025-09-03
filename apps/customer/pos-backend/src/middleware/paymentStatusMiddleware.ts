import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import prisma from '../lib/prisma';

export interface PaymentStatus {
  canLogin: boolean;
  canEdit: boolean;
  daysPastDue: number;
  stage: 'normal' | 'readonly' | 'blocked';
  message?: string;
}

export const checkPaymentStatus = async (tenantId: string): Promise<PaymentStatus> => {
  try {
    // Get overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lt: new Date() }
      },
      include: { payments: true }
    });

    if (overdueInvoices.length === 0) {
      return {
        canLogin: true,
        canEdit: true,
        daysPastDue: 0,
        stage: 'normal'
      };
    }

    // Get system settings
    const settings = await prisma.systemSettings.findFirst();
    const paymentGraceDays = settings?.paymentGraceDays || 7;
    const readOnlyGraceDays = settings?.readOnlyGraceDays || 14;
    const loginBlockGraceDays = settings?.loginBlockGraceDays || 21;

    // Find oldest overdue invoice
    const oldestOverdue = overdueInvoices.reduce((oldest, invoice) => 
      invoice.dueDate < oldest.dueDate ? invoice : oldest
    );

    const daysPastDue = Math.floor(
      (new Date().getTime() - new Date(oldestOverdue.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine access level based on days past due
    if (daysPastDue <= paymentGraceDays) {
      return {
        canLogin: true,
        canEdit: true,
        daysPastDue,
        stage: 'normal'
      };
    } else if (daysPastDue <= readOnlyGraceDays) {
      return {
        canLogin: true,
        canEdit: false,
        daysPastDue,
        stage: 'readonly'
      };
    } else if (daysPastDue <= loginBlockGraceDays) {
      return {
        canLogin: false,
        canEdit: false,
        daysPastDue,
        stage: 'blocked',
        message: 'Please contact support to enable login'
      };
    } else {
      // Auto-deactivate tenant after login block period
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { active: false }
      });
      
      return {
        canLogin: false,
        canEdit: false,
        daysPastDue,
        stage: 'blocked',
        message: 'Please contact support to enable login'
      };
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      canLogin: true,
      canEdit: true,
      daysPastDue: 0,
      stage: 'normal'
    };
  }
};

// Middleware to block edit operations during readonly period
export const blockEditOperations = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    const paymentStatus = await checkPaymentStatus(authReq.user.tenantId);
    
    if (!paymentStatus.canEdit && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return res.status(403).json({ 
        message: 'Edit operations are disabled due to overdue payments. Please contact support.',
        paymentStatus 
      });
    }
    
    // Add payment status to request for use in controllers
    (req as any).paymentStatus = paymentStatus;
    next();
  } catch (error) {
    console.error('Error in blockEditOperations middleware:', error);
    next();
  }
};