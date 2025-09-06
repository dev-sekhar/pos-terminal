import { convertCurrency } from '../services/currencyService';

export interface CurrencyConversionResult {
  originalAmount: number;
  convertedAmount: number;
  currency: string;
  exchangeRate?: {
    rate: number;
    date: string;
    fromCurrency: string;
    toCurrency: string;
  };
}

export class CurrencyConverter {
  private tenantCurrency: string;
  private baseCurrency: string = 'USD';

  constructor(tenantCurrency: string = 'USD') {
    this.tenantCurrency = tenantCurrency;
  }

  async convertFromBase(amount: number): Promise<CurrencyConversionResult> {
    if (this.tenantCurrency === this.baseCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        currency: this.tenantCurrency
      };
    }

    const converted = await convertCurrency(amount, this.baseCurrency, this.tenantCurrency);
    return {
      originalAmount: amount,
      convertedAmount: converted.convertedAmount,
      currency: this.tenantCurrency,
      exchangeRate: converted.exchangeRate
    };
  }

  async convertToBase(amount: number): Promise<CurrencyConversionResult> {
    if (this.tenantCurrency === this.baseCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        currency: this.baseCurrency
      };
    }

    const converted = await convertCurrency(amount, this.tenantCurrency, this.baseCurrency);
    return {
      originalAmount: amount,
      convertedAmount: converted.convertedAmount,
      currency: this.baseCurrency,
      exchangeRate: converted.exchangeRate
    };
  }

  async convertArray<T>(
    items: T[], 
    amountField: keyof T, 
    fromBase: boolean = true
  ): Promise<(T & { convertedAmount: CurrencyConversionResult })[]> {
    return Promise.all(
      items.map(async (item) => {
        const amount = item[amountField] as number;
        const converted = fromBase 
          ? await this.convertFromBase(amount)
          : await this.convertToBase(amount);
        
        return {
          ...item,
          convertedAmount: converted
        };
      })
    );
  }

  formatCurrency(amount: number, showSymbol: boolean = true): string {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹'
    };
    
    const symbol = showSymbol ? (symbols[this.tenantCurrency] || this.tenantCurrency) : '';
    return `${symbol}${amount.toFixed(2)}`;
  }
}