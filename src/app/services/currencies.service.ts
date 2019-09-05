import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Currency {
  address: string;
  symbol: string;
  isToken: boolean;
  bestInterestRate: {
    min: number,
    max: number,
    best: number
  };
}

@Injectable()
export class CurrenciesService {
  currencies: Array<Currency>;

  constructor() {
    const envCurrencies = environment.contracts.currencies;

    this.currencies = [
      {
        symbol: 'RCN',
        address: envCurrencies.rcn,
        isToken: true,
        bestInterestRate: {
          min: 0,
          max: 20,
          best: 10
        }
      },
      {
        symbol: 'DAI',
        address: envCurrencies.dai,
        isToken: true,
        bestInterestRate: {
          min: 10,
          max: 20,
          best: 15
        }
      },
      {
        symbol: 'ETH',
        address: envCurrencies.eth,
        isToken: true,
        bestInterestRate: {
          min: 0,
          max: 5,
          best: 1
        }
      }
    ];
  }

  /**
   * Return currencies array
   * @return Currencies
   */
  getCurrencies(onlyTokens: boolean = false): Array<Currency> {
    if (!onlyTokens) {
      return this.currencies;
    }

    return this.currencies.filter(currency => currency.isToken);
  }

  /**
   * Return filtered currency
   * @return Currency
   */
  getCurrencyByKey(key: 'symbol' | 'address', value: string): Currency {
    const filteredCurrency: Array<Currency> = this.currencies.filter(currency => currency[key].toLowerCase() === value.toLowerCase());

    if (filteredCurrency.length) {
      return filteredCurrency[0];
    }
  }

  /**
   * Return all currencies with a exception
   * @return Currencies
   */
  getCurrenciesExcept(key: 'symbol' | 'address', value: string): Array<Currency> {
    const filteredCurrency: Array<Currency> = this.currencies.filter(currency => currency[key].toLowerCase() !== value.toLowerCase());
    return filteredCurrency;
  }

}
