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
      case 'ETH':
      case 'WETH':
      case 'BNB':
      case 'WBNB':
      case 'RCN':
      case 'DAI':
      case 'TEST':
      case 'DEST':
        return 18;

      default:
        return 0;
    }
  }
  toString = (): string => this.symbol;
}
