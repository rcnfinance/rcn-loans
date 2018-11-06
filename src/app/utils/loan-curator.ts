import { Loan } from '../models/loan.model';

export class LoanCurator {
  static curateLoans(loans: Loan[]): Loan[] {
    return loans.filter(loan => {
      return loan.annualInterest < 1000 &&
            loan.annualPunitoryInterest < 1000 &&
            loan.amount < 1000000 &&
            loan.amount > 0.00001;
    });
  }
}
