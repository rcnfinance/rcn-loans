import * as BN from 'bn.js';
import { Utils } from './utils';

describe('Utils', () => {
  it('should return an interest rate', () => {
    const interestRate = (annualPercentage) => Utils.toInterestRate(annualPercentage);
    expect(interestRate(25)).toBe(12441600000000);
  });

  it('should return payment based on payments and interest rate', () => {
    const amount = 3000000000000000000000;
    const installments = 6;
    const rate = 0.5;
    const installmentDuration = 15 / 360;

    const pmt: BN = Utils.pmt(installmentDuration * rate, installments, amount).neg();
    expect(pmt).toEqual(Utils.bn(537084623188444900000));

    const pmtInWei: number = Number(pmt) / 10 ** 18;
    expect(pmtInWei.toFixed(2)).toEqual('537.08');
  });

  it('should return an amount in wei', () => {
    expect(Utils.getAmountInWei(0.5, 18).toString())
        .toEqual(Utils.bn(0.5 * 10 ** 18).toString());
    expect(Utils.getAmountInWei(1, 18).toString())
        .toEqual(Utils.bn(10 ** 18).toString());
    expect(Utils.getAmountInWei(15, 18).toString())
        .toEqual(Utils.bn(15 * 10 ** 18).toString());
    expect(Utils.getAmountInWei(100000, 6).toString())
        .toEqual(Utils.bn(100000 * 10 ** 6).toString());
  });

  it('should return a bn', () => {
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(new BN(1234))).toEqual(new BN(1234));
  });

  it('should return a string without scientific notation', () => {
    expect(Utils.scientificToDecimal(1e32)).toEqual(Utils.bn(10).pow(Utils.bn(32)).toString());
    expect(Utils.scientificToDecimal(1e64)).toEqual(Utils.bn(10).pow(Utils.bn(64)).toString());
    expect(Utils.scientificToDecimal(1e+12)).toEqual(Utils.bn(10).pow(Utils.bn(12)).toString());
    expect(Utils.scientificToDecimal(-1e+12)).toEqual(Utils.bn(10).pow(Utils.bn(12)).neg().toString());
    expect(Utils.scientificToDecimal(100)).toEqual('100');
    expect(Utils.scientificToDecimal(-100)).toEqual('-100');
  });

  it('should return an formatted amount', () => {
    expect(Utils.formatAmount(1234)).toEqual('1,234.00');
    expect(Utils.formatAmount(10000000000)).toEqual('10,000,000,000.00');
    expect(Utils.formatAmount(-1)).toEqual('-1.00');
    expect(Utils.formatAmount(new BN(500))).toEqual('500.00');
    expect(Utils.formatAmount('500')).toEqual('500.00');
    expect(Utils.formatAmount(0.0000006)).toEqual('0.0000006');
    expect(Utils.formatAmount(0.0000006, 2)).toEqual('0.0000006');
    expect(Utils.formatAmount(null)).toEqual('0.00');
    expect(Utils.formatAmount(undefined)).toEqual('0.00');
    expect(Utils.formatAmount(NaN)).toEqual('0.00');
    expect(Utils.formatAmount('test')).toEqual('0.00');
  });
});
