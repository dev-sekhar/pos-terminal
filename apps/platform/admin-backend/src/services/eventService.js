// Event service for real-time updates
import { EventEmitter } from 'events';

class BillingEventService extends EventEmitter {
  // Notify when new invoice is created
  notifyInvoiceCreated(tenantId, invoice) {
    this.emit(`invoice:created:${tenantId}`, invoice);
  }

  // Notify when payment is made
  notifyPaymentMade(tenantId, payment) {
    this.emit(`payment:made:${tenantId}`, payment);
  }

  // Subscribe to tenant billing events
  subscribeTenantEvents(tenantId, callback) {
    const invoiceHandler = (data) => callback('invoice:created', data);
    const paymentHandler = (data) => callback('payment:made', data);

    this.on(`invoice:created:${tenantId}`, invoiceHandler);
    this.on(`payment:made:${tenantId}`, paymentHandler);

    return () => {
      this.off(`invoice:created:${tenantId}`, invoiceHandler);
      this.off(`payment:made:${tenantId}`, paymentHandler);
    };
  }
}

export const billingEventService = new BillingEventService();