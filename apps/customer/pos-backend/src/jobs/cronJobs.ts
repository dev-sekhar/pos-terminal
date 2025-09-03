import cron from 'node-cron';
import { generateMonthlyInvoices } from '../services/invoiceGenerationService';

export const startCronJobs = () => {
  // Generate invoices on the 1st of every month at 9:00 AM
  cron.schedule('0 9 1 * *', async () => {
    console.log('Running monthly invoice generation cron job...');
    await generateMonthlyInvoices();
  });

  console.log('Cron jobs started successfully');
};