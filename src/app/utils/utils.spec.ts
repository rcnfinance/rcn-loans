import * as BN from 'bn.js';
import { Utils } from './utils';

describe('Utils', () => {
  it('should return an interest rate', () => {
    const interestRate = (annualPercentage) => Utils.toInterestRate(annualPercentage);
    expect(interestRate(25)).toBe(12441600000000);
  });

  it('should return payment based on payments and interest rate', () => {
    const amount = 3000;
    const installments = 6;
    const rate = 0.5;
    const installmentDuration = 15 / 360;
    expect(-Utils.pmt(installmentDuration * rate, installments, amount).toFixed(2)).toBe(537.08);
  });

  it('should return a bn', () => {
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(new BN(1234))).toEqual(new BN(1234));
  });
});
