import { Request, BasaltLoan, DiasporeDescriptor } from '../models/loan.model';
import { Utils } from './utils';

export class LoanUtils {
  static parseBasaltLoan(engine: string, id: number, loanBytes: any): BasaltLoan {
    return new BasaltLoan(
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
            Utils.formatAddress(loanBytes[0]),
            Utils.formatAddress(loanBytes[3])
        );
  }
  static parseRequest(engine: string, bytes: any): Request {
    const amount = parseInt(bytes[3], 16);
    return new Request(
            engine,
            bytes[0],
            Utils.formatAddress(bytes[1]),
            Utils.formatAddress(bytes[2]),
            amount,
            bytes[4],
            Utils.formatAddress(bytes[5]),
            parseInt(bytes[7], 16),
            Utils.formatAddress(bytes[8]),
            new DiasporeDescriptor(
                amount,
                parseInt(bytes[13], 16),
                parseInt(bytes[11], 16),
                parseInt(bytes[12], 16)
            )
        );
  }
}
