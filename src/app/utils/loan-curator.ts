import { Loan } from '../models/loan.model';

export class LoanCurator {
  static curateBasaltRequests(loans: Loan[]): Loan[] {
    // return loans;
    return loans.filter(loan => {
      const amount = loan.currency.fromUnit(loan.amount);
      return loan.descriptor.punitiveInterestRateRate < 1000 &&
                loan.descriptor.interestRate < 1000 &&
                amount < 1000000 &&
                amount > 0.00001;
    });
  }
}
