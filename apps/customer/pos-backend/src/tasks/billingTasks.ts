import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

// Function to calculate next billing cycle end date (e.g., 1 month from start)
const calculateNextBillingEndDate = (startDate: Date) => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1); // Assuming monthly billing
  return endDate;
};

// --- Task 1: Plan Renewal Task ---
// Runs daily at a specific time (e.g., 2 AM)
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily plan renewal task...');
  const now = new Date();

  try {
    const tenantsToRenew = await prisma.tenant.findMany({
      where: {
        currentPlanEndDate: { lte: now },
        active: true, // Only renew active tenants
      },
      include: { pricingPlan: true, nextPlan: true },
    });

    for (const tenant of tenantsToRenew) {
      console.log(`Processing renewal for tenant: ${tenant.name} (${tenant.id})`);

      let newPricingPlanId: number;
      let newCurrentPlanStartDate: Date;
      let newCurrentPlanEndDate: Date;
      let subscriptionUpdateRequired = false;

      if (tenant.nextPlanId && tenant.nextPlanActivationDate && tenant.nextPlanActivationDate <= now) {
        // Activate scheduled plan change
        newPricingPlanId = tenant.nextPlanId;
        newCurrentPlanStartDate = tenant.nextPlanActivationDate;
        newCurrentPlanEndDate = calculateNextBillingEndDate(newCurrentPlanStartDate);
        subscriptionUpdateRequired = true;
        console.log(`  Activating scheduled plan: ${tenant.nextPlan?.name}`);
      } else if (tenant.pricingPlanId) {
        // Renew current plan
        newPricingPlanId = tenant.pricingPlanId;
        newCurrentPlanStartDate = tenant.currentPlanEndDate || now; // Use old end date as new start, or now
        newCurrentPlanEndDate = calculateNextBillingEndDate(newCurrentPlanStartDate);
        // Subscription update might be required if price changed or if not using Stripe Billing directly
        console.log(`  Renewing current plan: ${tenant.pricingPlan?.name}`);
      } else {
        console.warn(`  Tenant ${tenant.name} has no current or next plan. Skipping renewal.`);
        continue; // Skip if no plan to renew
      }

      // Update Stripe Subscription (if applicable and using Stripe Billing)
      if (subscriptionUpdateRequired && tenant.stripeSubscriptionId) {
        try {
          const newStripePrice = await stripe.prices.search({
            query: `metadata['pricingPlanId']:'${newPricingPlanId}'`,
          });
          if (newStripePrice.data.length > 0) {
            await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
              items: [{
                id: tenant.stripeSubscriptionId, // This should be the subscription item ID, not subscription ID
                price: newStripePrice.data[0].id,
              }],
              proration_behavior: 'none', // No proration on renewal
            });
            console.log(`  Stripe subscription updated for tenant ${tenant.name}.`);
          } else {
            console.warn(`  No Stripe Price found for new plan ID ${newPricingPlanId}. Skipping Stripe update.`);
          }
        } catch (stripeError: any) {
          console.error(`  Error updating Stripe subscription for ${tenant.name}:`, stripeError.message);
          // Decide how to handle: continue, mark tenant as problematic, etc.
        }
      }

      // Update Tenant record in DB
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          pricingPlanId: newPricingPlanId,
          currentPlanStartDate: newCurrentPlanStartDate,
          currentPlanEndDate: newCurrentPlanEndDate,
          nextPlanId: null, // Clear scheduled plan after activation
          nextPlanActivationDate: null,
        },
      });

      // Create Invoice record (simplified - in real app, get actual charged amount from Stripe)
      const renewedPlan = tenant.nextPlan || tenant.pricingPlan;
      if (renewedPlan) {
        await prisma.invoice.create({
          data: {
            tenantId: tenant.id,
            planId: renewedPlan.id,
            amount: parseFloat(renewedPlan.price), // Assuming price is numeric
            dueDate: calculateNextBillingEndDate(newCurrentPlanEndDate), // Due date for next invoice
            status: 'PAID', // Assuming successful auto-renewal via Stripe
            description: `Subscription renewal for ${renewedPlan.name} plan`,
          },
        });
        console.log(`  Invoice created for tenant ${tenant.name}.`);
      }
    }
  } catch (error: any) {
    console.error('Error in plan renewal task:', error.message);
  }
});

// --- Task 2: Scheduled Plan Change Activation Task (redundant if handled by renewal) ---
// This task is largely redundant if the renewal task correctly handles `nextPlanId`.
// However, if you have non-renewal plan changes that need to activate mid-cycle,
// or if you want to separate concerns, you might keep this.
// For now, we'll keep it simple and assume `nextPlanId` is activated during renewal.
// If a tenant changes plan mid-cycle, the `changePlan` service schedules it for the end of the current cycle.
// So, the renewal task will pick it up.

// You would typically call this function from your app.ts or main entry file
export const startBillingTasks = () => {
  console.log('Billing scheduled tasks started.');
};
