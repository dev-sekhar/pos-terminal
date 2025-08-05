export const calcItemTotal = (item) => {
  if (!item) return 0;
  const base = (item.quantity || 0) * (item.price || 0);
  const discount = base * (Number(item.discount || 0) / 100);
  const taxed = (base - discount) * (1 + Number(item.tax || 0) / 100);
  return Math.round(taxed * 100) / 100;
};

export const calcSubtotal = (items) =>
  Array.isArray(items)
    ? items.reduce((sum, item) => sum + calcItemTotal(item), 0)
    : 0;

export const calcTotal = (items, basketDiscount = 0) => {
  const subtotal = calcSubtotal(items);
  const discountAmt = subtotal * (Number(basketDiscount) / 100);
  return Math.round((subtotal - discountAmt) * 100) / 100;
};