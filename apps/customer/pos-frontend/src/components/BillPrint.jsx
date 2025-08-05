import React from 'react';
import { calcItemTotal, calcSubtotal, calcTotal } from '../../utils/salesUtils';

const BillPrint = React.forwardRef(({ sale, settings }, ref) => {
  const currency = settings?.currency || '$';
  if (!sale) return null;

  return (
    <div ref={ref} className="bill-print">
      <h2 className="bill-print-header">POS Terminal</h2>
      <div className="bill-print-info">
        <div><strong>Invoice:</strong> {sale.invoice}</div>
        <div><strong>Date/Time:</strong> {new Date(sale.datetime).toLocaleString()}</div>
        <div><strong>Payment:</strong> {sale.paymentType}</div>
      </div>
      <table className="bill-print-table">
        <thead>
          <tr>
            <th align="left">Item</th><th align="right">Qty</th><th align="right">Price</th><th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(sale.items) &&
            sale.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.product?.name || "N/A"}</td>
                <td align="right">{item.quantity}</td>
                <td align="right">{item.price.toFixed(2)}</td>
                <td align="right">{calcItemTotal(item).toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="bill-print-divider"></div>
      <div className="bill-print-totals">
        <div><strong>Subtotal:</strong> {currency} {calcSubtotal(sale.items).toFixed(2)}</div>
        <div><strong>Discount:</strong> {sale.discount || 0}%</div>
        <div><strong>Total:</strong> {currency} {calcTotal(sale.items, sale.discount).toFixed(2)}</div>
      </div>
    </div>
  );
});

export default BillPrint;