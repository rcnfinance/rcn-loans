import { Loan } from '../models/loan.model';
import { environment } from '../../environments/environment';

export class LoanCurator {
  static curateLoans(loans: Loan[]): Loan[] {
    return loans.filter(loan => {
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
      return loan.annualInterest < 1000 &&
            loan.annualPunitoryInterest < 1000 &&
            loan.amount < 1000000 &&
            loan.amount > 0.00001;
    });
  }
}
