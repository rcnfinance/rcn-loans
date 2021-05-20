import { Injectable } from '@angular/core';
import * as BN from 'bn.js';
import { Utils } from 'app/utils/utils';
import { Currency } from 'app/utils/currencies';
import { ChainService } from 'app/services/chain.service';

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
    'RCN': { min: 5, max: 15, best: 10 },
    'DAI': { min: 10, max: 20, best: 15 },
    'USDC': { min: 5, max: 10, best: 7 },
    'ARS': { min: 40, max: 80, best: 60 },
    'ETH': { min: 0, max: 5, best: 1 },
    'BNB': { min: 0, max: 5, best: 1 },
    'TEST': { min: 0, max: 20, best: 10 },
    'DEST': { min: 10, max: 20, best: 15 }
  };

  constructor(
    private chainService: ChainService
  ) {
    this.buildCurrencies();
  }

  /**
   * Return filter currencies array
   * @return Currencies
   */
  getFilterCurrencies(): Array<string> {
    const CRYPTO_CURRENCIES: string[] =
      this.currencies.map(({ symbol }) => symbol);
    const FIAT_CURRENCIES: string[] =
      ['USD'];

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
    return this.currencies.find(
      currency => currency[key] &&
        value &&
        currency[key].toLowerCase() === value.toLowerCase()
    );
  }

  /**
   * Return only this currencies
   * @return Currencies
   */
  getCurrenciesByKey(key: 'symbol' | 'address', value: string | string[]): Array<CurrencyItem> {
    let repulsedValues = typeof value === 'string' ? [value] : value;
    repulsedValues = repulsedValues.map((item) => item.toLowerCase());

    const filteredCurrency: Array<CurrencyItem> = this.currencies.filter(
      currency => repulsedValues.includes(currency[key].toLowerCase())
    );
    return filteredCurrency;
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

  /**
   * Raw amount to readable amount
   * @param amount Raw amount
   * @param symbol Currency symbol
   * @return Formatted amount
   */
  getAmountFromDecimals(amount: number | string | BN, symbol: string): number {
    const decimals = this.getCurrencyDecimals('symbol', symbol);
    return Number(amount) / 10 ** decimals;
  }

  /**
   * Get currency decimals
   * @param key CurrencyItem key
   * @param value Symbol or token address
   * @return Decimals
   */
  getCurrencyDecimals(key: 'symbol' | 'address', value: string): number {
    const { symbol } = this.getCurrencyByKey(key, value);
    const { decimals: expectedDecimals } = new Currency(symbol);
    const { config } = this.chainService;
    const decimals = config.currencies.currencyDecimals[symbol] || expectedDecimals;
    return decimals;
  }

  /**
   * Build currencies using the current chain config
   */
  private buildCurrencies() {
    const { config } = this.chainService;
    const envCurrencies = config.currencies.usableCurrencies;
    const currencies: CurrencyItem[] = [];

    envCurrencies.map((currency: {
      symbol: string;
      address: string;
      img: string;
    }) => {
      const address = currency.address;
      const symbol = currency.symbol;
      const img = currency.img;
      const isToken = currency.address && currency.address !== Utils.address0x;
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
}
