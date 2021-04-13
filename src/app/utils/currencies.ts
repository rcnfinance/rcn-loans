import * as BN from 'bn.js';

export class Currency {
  decimals: number;
  constructor(
    public symbol: string
  ) {
    this.decimals = Currency.getDecimals(symbol);
  }
  static getDecimals(currency: string): number {
    switch (currency.toUpperCase()) {
      case 'ARS':
      case 'USD':
        return 2;

      case 'USDC':
        return 6;

      case 'ETH':
      case 'BNB':
      case 'RCN':
      case 'DAI':
      case 'TEST':
      case 'DEST':
        return 18;

      default:
        return 0;
    }
  }
  fromUnit(n: number | string | BN): number {
    if (typeof n !== 'number') {
      n = Number(n);
    }

    return n / 10 ** this.decimals;
  }
  toString = (): string => this.symbol;
}
