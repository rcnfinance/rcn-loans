import { Loan } from '../models/loan.model';
import { environment } from '../../environments/environment';

export class LoanCurator {
  static curateLoans(loans: Loan[]): Loan[] {
    return loans.filter(loan => {
      if (!loan) {
        return;
      }

      const amount = loan.currency.fromUnit(loan.amount);

      // Check blacklist
      let blacklisted = false;
      environment.blacklist.forEach(element => {
        if (element.forbidden.includes(loan[element.key])) {
          blacklisted = true;
          return;
        }
      });
      if (blacklisted) { return false; }

      // Check common wrong values
      return loan.descriptor.interestRate > 0 &&
      loan.descriptor.interestRate < 1000 &&
      loan.descriptor.punitiveInterestRateRate < 1000 &&
      amount < 1000000 &&
      amount > 0.00001;
    });
  }
}
