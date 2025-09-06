// Currency conversion service with live exchange rates
export interface ExchangeRateData {
  rate: number;
  date: string;
  fromCurrency: string;
  toCurrency: string;
}

export interface ConvertedAmount {
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: ExchangeRateData;
}

// Get live exchange rate from API
export const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<ExchangeRateData> => {
  console.log('Getting exchange rate for:', fromCurrency, 'to', toCurrency);
  
  // If same currency, return 1:1 rate
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      date: new Date().toISOString().split('T')[0],
      fromCurrency,
      toCurrency
    };
  }

  try {
    // Primary API: exchangerate-api.com (free tier, no key required)
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
    console.log('Trying primary API:', url);
    const response = await fetch(url);
    console.log('Primary API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Primary API data:', data);
      if (data.rates && data.rates[toCurrency]) {
        return {
          rate: data.rates[toCurrency],
          date: data.date || new Date().toISOString().split('T')[0],
          fromCurrency,
          toCurrency
        };
      }
    }
  } catch (error) {
    console.log('Primary exchange API failed:', error);
  }

  try {
    // Backup API: frankfurter.app (free, no key required)
    const url = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`;
    console.log('Trying backup API:', url);
    const response = await fetch(url);
    console.log('Backup API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backup API data:', data);
      if (data.rates && data.rates[toCurrency]) {
        return {
          rate: data.rates[toCurrency],
          date: data.date || new Date().toISOString().split('T')[0],
          fromCurrency,
          toCurrency
        };
      }
    }
  } catch (error) {
    console.log('Backup exchange API failed:', error);
  }

  try {
    // Web scraping fallback: xe.com
    console.log('Trying web scraping fallback...');
    const url = `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${fromCurrency}&To=${toCurrency}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      // Look for the conversion rate in the HTML
      const rateMatch = html.match(/"to":\[{"quoteCurrency":"[^"]+","exchangeRate":([0-9.]+)/i);
      if (rateMatch && rateMatch[1]) {
        const rate = parseFloat(rateMatch[1]);
        console.log('Web scraping found rate:', rate);
        return {
          rate,
          date: new Date().toISOString().split('T')[0],
          fromCurrency,
          toCurrency
        };
      }
    }
  } catch (error) {
    console.log('Web scraping fallback failed:', error);
  }

  // If all methods fail, throw error instead of returning wrong rate
  console.error('All exchange rate sources failed');
  throw new Error(`Unable to get exchange rate from ${fromCurrency} to ${toCurrency}. Please try again later.`);
};

// Convert amount with exchange rate info
export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<ConvertedAmount> => {
  console.log('=== CURRENCY CONVERSION DEBUG ===');
  console.log('Converting:', amount, fromCurrency, 'to', toCurrency);
  
  try {
    const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
    console.log('Exchange Rate Retrieved:', exchangeRate);
    
    const convertedAmount = amount * exchangeRate.rate;
    console.log('Calculation:', amount, 'x', exchangeRate.rate, '=', convertedAmount);
    
    const result = {
      originalAmount: amount,
      convertedAmount,
      exchangeRate
    };
    console.log('Final Result:', result);
    console.log('=== END CURRENCY DEBUG ===');
    
    return result;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    // Return original amount with error indicator instead of wrong conversion
    const result = {
      originalAmount: amount,
      convertedAmount: amount,
      exchangeRate: {
        rate: 1,
        date: new Date().toISOString().split('T')[0],
        fromCurrency,
        toCurrency,
        error: 'Exchange rate unavailable'
      }
    };
    console.log('Fallback Result:', result);
    console.log('=== END CURRENCY DEBUG ===');
    return result;
  }
};