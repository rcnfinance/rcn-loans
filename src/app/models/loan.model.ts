
import { Utils } from './../utils/utils';
import { Currency } from '../utils/currencies';

export enum Status { Request, Ongoing, Paid, Destroyed, Expired, Indebt }

function timestamp(): number {
  return (new Date().getTime() / 1000);
}

function calculateInterest(timeDelta: number, interestRate: number, amount: number): number {
  if (amount === 0) {
    return 0;
  }

  return (amount * 100000 * timeDelta) / interestRate;
}

export class Loan {
  constructor(
        public engine: string,
        public id: number,
        public oracle: string,
        public statusFlag: number,
        public borrower: string,
        public creator: string,
        public rawAmount: number,
        public duration: number,
        public rawAnnualInterest: number,
        public rawAnnualPunitoryInterest: number,
        public currencyRaw: string,
        public rawPaid: number,
        public cumulatedInterest: number,
        public cumulatedPunnitoryInterest: number,
        public interestTimestamp: number,
        public dueTimestamp: number,
        public lenderBalance: number,
        public expirationRequest: number,
        public owner: string,
        public cosigner: string
    ) { }

  get status(): Status {
    if (this.statusFlag === Status.Ongoing && timestamp() > this.dueTimestamp) {
      return Status.Indebt;
    }
    if (new Date(this.expirationRequest).getTime() / 1000 <= new Date().getTime() / 1000) {
      return Status.Expired;
    }
    return this.statusFlag;
  }

  get lentTimestamp(): number {
    return this.dueTimestamp - this.duration;
  }

  get remainingTime(): number {
    return this.dueTimestamp - timestamp();
  }

  get rawTotal(): number {
    let newInterest = this.cumulatedInterest;
    let newPunitoryInterest = this.cumulatedPunnitoryInterest;
    let pending;
    let deltaTime;
    const endNonPunitory = Math.min(timestamp(), this.dueTimestamp);
    if (endNonPunitory > this.interestTimestamp) {
      deltaTime = endNonPunitory - this.interestTimestamp;

      if (this.rawPaid < this.rawAmount) {
        pending = this.rawAmount - this.rawPaid;
      } else {
        pending = 0;
      }

      newInterest += calculateInterest(deltaTime, this.rawAnnualInterest, pending);
    }

    if (timestamp() > this.dueTimestamp) {
      const startPunitory = Math.max(this.dueTimestamp, this.interestTimestamp);
      deltaTime = timestamp() - startPunitory;
      const debt = this.rawAmount + newInterest;
      pending = Math.min(debt, (debt + newPunitoryInterest) - this.rawPaid);
      newPunitoryInterest += calculateInterest(deltaTime, this.rawAnnualPunitoryInterest, pending);
    }

    return this.rawAmount + newInterest + newPunitoryInterest;
  }

  get total(): number {
    return this.rawTotal / 10 ** this.decimals;
  }

  get rawPendingAmount() {
    return this.rawTotal - this.rawPaid;
  }

  get pendingAmount(): number {
    return this.rawPendingAmount / 10 ** this.decimals;
  }

  get paid(): number {
    return this.rawPaid / 10 ** this.decimals;
  }

  get uid(): string {
    return this.engine + this.id;
  }

  get currency(): string {
    const targetCurrency = Utils.hexToAscii(this.currencyRaw.replace(/^[0x]+|[0]+$/g, ''));
    return targetCurrency === '' ? 'RCN' : targetCurrency;
  }

  get decimals(): number {
    // TODO: Detect fiat currency
    return Currency.getDecimals(this.currency);
  }

  get amount(): number {
    return this.rawAmount / 10 ** this.decimals;
  }

  get annualInterest(): number {
    return Utils.formatInterest(this.rawAnnualInterest);
  }

  get annualPunitoryInterest(): number {
    return Utils.formatInterest(this.rawAnnualPunitoryInterest);
  }

  get verboseDuration(): string {
    return Utils.formatDelta(this.duration);
  }

  get expectedReturn(): number {
    return ((this.amount * 100000 * this.duration) / this.rawAnnualInterest) + this.amount;
  }

  get borrowerShort(): string {
    return Utils.shortAddress(this.borrower);
  }
}
