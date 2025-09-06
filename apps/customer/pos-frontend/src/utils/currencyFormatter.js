// Frontend currency formatting utility
export const formatCurrency = (amount, tenantSettings, convertedData = null) => {
  const currency = tenantSettings?.currency || 'USD';
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹'
  };
  const symbol = currencySymbols[currency] || currency;
  
  if (convertedData && currency !== 'USD') {
    return {
      display: `${symbol}${convertedData.convertedAmount.toFixed(2)}`,
      rateInfo: `Rate: 1 USD = ${convertedData.exchangeRate.rate.toFixed(4)} ${currency}, ${convertedData.exchangeRate.date}`
    };
  }
  
  return {
    display: `${symbol}${amount.toFixed(2)}`,
    rateInfo: null
  };
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹'
  };
  return symbols[currency] || currency;
};