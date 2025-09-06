// Event service for real-time updates
import { EventEmitter } from 'events';

class BillingEventService extends EventEmitter {
  // Notify when new invoice is created
  notifyInvoiceCreated(tenantId: string, invoice: any) {
    console.log('[EVENT SERVICE] Notifying invoice created for tenant:', tenantId, 'Invoice:', invoice);
    this.emit(`invoice:created:${tenantId}`, invoice);
    console.log('[EVENT SERVICE] Event emitted for invoice:created:', tenantId);
  }

  // Notify when payment is made
  notifyPaymentMade(tenantId: string, payment: any) {
    console.log('[EVENT SERVICE] Notifying payment made for tenant:', tenantId, 'Payment:', payment);
    this.emit(`payment:made:${tenantId}`, payment);
    console.log('[EVENT SERVICE] Event emitted for payment:made:', tenantId);
  }

  // Subscribe to tenant billing events
  subscribeTenantEvents(tenantId: string, callback: (event: string, data: any) => void) {
    const invoiceHandler = (data: any) => callback('invoice:created', data);
    const paymentHandler = (data: any) => callback('payment:made', data);

    this.on(`invoice:created:${tenantId}`, invoiceHandler);
    this.on(`payment:made:${tenantId}`, paymentHandler);

    return () => {
      this.off(`invoice:created:${tenantId}`, invoiceHandler);
      this.off(`payment:made:${tenantId}`, paymentHandler);
    };
  }
}

export const billingEventService = new BillingEventService();