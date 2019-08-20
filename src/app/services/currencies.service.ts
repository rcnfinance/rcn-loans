import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Currency {
  address: string;
  symbol: string;
}

@Injectable()
export class CurrenciesService {
  currencies: Array<Currency>;

  constructor() {
    const envCurrencies = environment.contracts.currencies;

    this.currencies = [
      {
        symbol: 'RCN',
        address: envCurrencies.rcn
      },
      {
        symbol: 'DAI',
        address: envCurrencies.dai
      },
      {
        symbol: 'ETH',
        address: envCurrencies.eth
      }
    ];
  }

  /**
   * Return currencies array
   * @return Currencies
   */
  getCurrencies(): Array<Currency> {
    return this.currencies;
  }

  /**
   * Return filtered currency
   * @return Currency
   */
  getCurrencyByKey(key: 'symbol' | 'address', value: string): Currency {
    const filteredCurrency: Array<Currency> = this.currencies.filter(currency => currency[key] === value);

    if (filteredCurrency.length) {
      return filteredCurrency[0];
    }
  }

  /**
   * Return all currencies with a exception
   * @return Currencies
   */
  getCurrenciesExcept(key: 'symbol' | 'address', value: string): Array<Currency> {
    const filteredCurrency: Array<Currency> = this.currencies.filter(currency => currency[key] !== value);
    return filteredCurrency;
  }

}
