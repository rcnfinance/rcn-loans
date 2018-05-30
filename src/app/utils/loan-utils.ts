import { Loan } from '../models/loan.model';
import { Utils } from './utils';

export class LoanUtils {
    static loanFromBytes(engine: string, id: number, loanBytes: any): Loan {
        return new Loan(
          engine,
          id,
          Utils.formatAddress(loanBytes[1]),
          parseInt(loanBytes[14], 16),
          Utils.formatAddress(loanBytes[2]),
          Utils.formatAddress(loanBytes[4]),
          parseInt(loanBytes[5], 16),
          parseInt(loanBytes[12], 16),
          parseInt(loanBytes[9], 16),
          parseInt(loanBytes[10], 16),
          loanBytes[16],
          parseInt(loanBytes[8], 16),
          parseInt(loanBytes[18], 16),
          parseInt(loanBytes[6], 16),
          parseInt(loanBytes[7], 16),
          parseInt(loanBytes[11], 16),
          parseInt(loanBytes[15], 16),
          Utils.formatAddress(loanBytes[0])
        );
    }
}
