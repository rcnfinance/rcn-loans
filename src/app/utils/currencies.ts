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

      case 'ETH':
      case 'BNB':
      case 'RCN':
      case 'DAI':
      case 'USDC':
      case 'TEST':
      case 'DEST':
      case 'MATIC':
        return 18;

      default:
        return 0;
    }
  }
  toString = (): string => this.symbol;
}
