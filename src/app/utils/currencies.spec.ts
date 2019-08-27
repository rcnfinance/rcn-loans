import { Currency } from './currencies';

describe('Currency', () => {
  it('should return the currency decimals', () => {
    expect(Currency.getDecimals('ARS')).toBe(2);
    expect(Currency.getDecimals('MANA')).toBe(18);
    expect(Currency.getDecimals('ETH')).toBe(18);
    expect(Currency.getDecimals('RCN')).toBe(18);
    expect(Currency.getDecimals('TEST')).toBe(18);
    expect(Currency.getDecimals('DEST')).toBe(18);
  });
});
