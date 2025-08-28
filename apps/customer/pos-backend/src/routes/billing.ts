import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();
const prisma = new PrismaClient();

// Make payment
router.post('/payments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, method, reference } = req.body;
    const { tenantId } = req.user;

    // Create invoice for payment
    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        amount,
        dueDate: new Date(),
        status: 'PAID',
        description: 'Plan upgrade payment'
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        paymentDate: new Date(),
        method,
        reference
      }
    });

    res.json({ success: true, payment, invoice });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Get tenant billing info
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tenantId } = req.user;
    
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: { payments: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalDue = invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => {
        const paid = inv.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
        return sum + (inv.amount - paid);
      }, 0);

    res.json({ invoices, totalDue });
  } catch (error) {
    console.error('Billing fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch billing data' });
  }
});

export default router;