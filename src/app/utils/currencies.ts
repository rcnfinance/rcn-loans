
export class Currency {
  decimals;
  constructor(currency: string) {
    this.decimals = Currency.getDecimals(currency);
  }
  static getDecimals(currency: string): number {
    switch (currency.toUpperCase()) {
      case 'ARS':
        return 2;

      case 'MANA':
      case 'ETH':
      case 'RCN':
        return 18;

      case 'MANA':
      case 'ETH':
      case 'RCN':
        return 18;

      default:
        return 0;
    }
  }
  fromUnit(n: number): number {
    return n / 10 ** this.decimals;
  }
}
