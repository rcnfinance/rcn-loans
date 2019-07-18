import { Utils } from './utils';

describe('Utils', () => {
  it('should return an interest rate', () => {
    const interestRate = (annualPercentage) => Utils.toInterestRate(annualPercentage);
    expect(interestRate(25)).toBe(12441600000000);
  });
});
