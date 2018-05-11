import { Loan } from '../models/loan.model';

export class LoanUtils {
    static loanFromBytes(id: number, loanBytes: any): Loan {
        return new Loan(
          id,
          parseInt(loanBytes[14], 16),
          loanBytes[2],
          loanBytes[4],
          parseInt(loanBytes[5], 16),
          parseInt(loanBytes[12], 16),
          parseInt(loanBytes[9], 16),
          parseInt(loanBytes[10], 16),
          loanBytes[16]
        );
    }  
}