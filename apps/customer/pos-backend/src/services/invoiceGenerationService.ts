import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateMonthlyInvoices = async () => {
  try {
    console.log('Starting monthly invoice generation...');
    
    // Get all active tenants with paid pricing plans
    const tenants = await prisma.tenant.findMany({
      where: { 
        active: true,
        pricingPlanId: { not: null }
      },
      include: { pricingPlan: true }
    });

    let invoicesGenerated = 0;

    for (const tenant of tenants) {
      const plan = tenant.pricingPlan;
      
      // Skip free plans or contact us plans
      if (!plan || !plan.price || plan.price === 0) continue;

      // Check if tenant already has an invoice for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          tenantId: tenant.id,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      if (existingInvoice) {
        console.log(`Tenant ${tenant.name} already has invoice for current month`);
        continue;
      }

      // Generate invoice
      const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      await prisma.invoice.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          amount: plan.price,
          dueDate,
          status: 'PENDING',
          description: `Monthly subscription for ${plan.name} plan - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        }
      });

      invoicesGenerated++;
      console.log(`Generated invoice for ${tenant.name}: $${plan.price}`);
    }

    console.log(`Invoice generation completed. Generated ${invoicesGenerated} invoices.`);
    return { success: true, invoicesGenerated };
  } catch (error) {
    console.error('Error generating invoices:', error);
    return { success: false, error: error.message };
  }
};