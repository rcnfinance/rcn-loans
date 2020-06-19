import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface BestInterestRate {
  min: number;
  max: number;
  best: number;
}

export interface CurrencyItem {
  address: string;
  symbol: string;
  img: string;
  isToken: boolean;
  bestInterestRate: BestInterestRate;
}

@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {
  currencies: CurrencyItem[];
  bestInterestRates = {
    'RCN': { min: 0, max: 20, best: 10 },
    'DAI': { min: 10, max: 20, best: 15 },
    'USDC': { min: 10, max: 20, best: 15 },
    'MANA': { min: 10, max: 20, best: 15 },
    'ETH': { min: 0, max: 5, best: 1 },
    'TEST': { min: 0, max: 20, best: 10 },
    'DEST': { min: 10, max: 20, best: 15 }
  };

  constructor() {
    const envCurrencies = environment.usableCurrencies;
    const currencies: CurrencyItem[] = [];

    envCurrencies.map((currency: {
      symbol: string;
      address: string;
      img: string;
    }) => {
      const address = currency.address;
      const symbol = currency.symbol;
      const img = currency.img;
      const isToken = currency.address ? true : false;
      const bestInterestRate = this.getBestInterest(symbol);
      const formattedCurrency: CurrencyItem = {
        address,
        symbol,
        img,
        isToken,
        bestInterestRate
      };
      currencies.push(formattedCurrency);
    });

    this.currencies = currencies;
  }

  /**
   * Return filter currencies array
   * @return Currencies
   */
  getFilterCurrencies(): Array<string> {
    const CRYPTO_CURRENCIES: string[] =
      this.currencies.map(({ symbol }) => symbol);
    const FIAT_CURRENCIES: string[] =
      ['ARS', 'USD'];

    return CRYPTO_CURRENCIES.concat(FIAT_CURRENCIES);
  }

  /**
   * Return currencies array
   * @return Currencies
   */
  getCurrencies(onlyTokens: boolean = false): Array<CurrencyItem> {
    if (!onlyTokens) {
      return this.currencies;
    }

    return this.currencies.filter(currency => currency.isToken);
  }

  /**
   * Return filtered currency
   * @return Currency
   */
  getCurrencyByKey(key: 'symbol' | 'address', value: string): CurrencyItem {
    const filteredCurrency: Array<CurrencyItem> = this.currencies.filter(
      currency => currency[key].toLowerCase() === value.toLowerCase()
    );

    if (filteredCurrency.length) {
      return filteredCurrency[0];
    }
  }

  /**
   * Return all currencies with a exception
   * @return Currencies
   */
  getCurrenciesExcept(key: 'symbol' | 'address', value: string | string[]): Array<CurrencyItem> {
    let repulsedValues = typeof value === 'string' ? [value] : value;
    repulsedValues = repulsedValues.map((item) => item.toLowerCase());

    const filteredCurrency: Array<CurrencyItem> = this.currencies.filter(
      currency => !repulsedValues.includes(currency[key].toLowerCase())
    );
    return filteredCurrency;
  }

  /**
   * Return the best interest rate for the selected currency
   * @return BestInterestRate
   */
  getBestInterest(symbol: string): BestInterestRate {
    const bestInterest = this.bestInterestRates[symbol];
    let min = 0;
    let max = 0;
    let best = 0;

    if (bestInterest) {
      min = bestInterest.min;
      max = bestInterest.max;
      best = bestInterest.best;
    }

    return {
      min,
      max,
      best
    };
  }

}
