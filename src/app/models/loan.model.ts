
import { Utils } from './../utils/utils';
import { Currency } from '../utils/currencies';

export enum Status {
    Request,
    Ongoing,
    Paid,
    Destroyed,
    Indebt
}

export interface Descriptor {
  getInterestRate(): string;
  getPunitiveInterestRate(): string;
  getEstimatedReturn(): number;
  getDuration(): number;
}

export class Request {
  constructor(
        public engine: string,
        public id: string,
        public borrower: string,
        public creator: string,
        public amount: number,
        public currency: string,
        public oracle: string,
        public expiration: number,
        public model: string,
        public descriptor: Descriptor
    ) { }

  get isRequest() { return true; }

  get status() { return Status.Request; }

  decimals(): number {
    return Currency.getDecimals(this.readCurrency());
  }

  readCurrency(): string {
    const targetCurrency = Utils.hexToAscii(this.currency.replace(/^[0x]+|[0]+$/g, ''));
    return targetCurrency === '' ? 'RCN' : targetCurrency;
  }

  readAmount(): number {
    return this.amount / 10 ** this.decimals();
  }
}

export class Loan extends Request {
  constructor(
        public engine: string,
        public id: string,
        public borrower: string,
        public owner: string,
        public creator: string,
        public amount: number,
        public currency: string,
        public oracle: string,
        public expiration: number,
        public model: string,
        public _status: Status,
        public lentTime: number,
        public lenderBalance: number,
        // To review
        public cosigner: string,
        // Model
        public dueTime: number,
        public paid: number,
        public estimated: number,
        public interestRate: number,
        public punitiveInterestRate: number
    ) {
    super(
            engine,
            id,
            borrower,
            creator,
            amount,
            currency,
            oracle,
            expiration,
            model,
            undefined
        );
  }

  get status() { return this._status; }
  get isRequest() { return false; }

  get remainingTime() { return this.dueTime - (new Date().getTime() / 1000); }
}

export class BasaltDescriptor implements Descriptor {
  constructor(
          private interestRate: number,
          private punitiveInterestRate: number,
          private amount: number,
          private duration: number
      ) { }
  getPunitiveInterestRate(): string {
    return Utils.formatInterest(this.punitiveInterestRate).toPrecision(2);
  }
  getInterestRate(): string {
    return Utils.formatInterest(this.interestRate).toPrecision(2);
  }
  getEstimatedReturn(): number {
    return ((this.amount * 100000 * this.duration) / this.interestRate) + this.amount;
  }
  getDuration(): number {
    return this.duration;
  }
}

export class BasaltLoan extends Loan {
  constructor(
        public engine: string,
        public idNumber: number,
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
        public owner: string,
        public cosigner: string
    ) {
    super(
            engine,
            idNumber.toString(),
            borrower,
            owner,
            creator,
            rawAmount,
            currencyRaw,
            oracle,
            0,
            Utils.address0x,
            statusFlag === Status.Ongoing && (new Date().getTime() / 1000) > dueTimestamp ? Status.Indebt : statusFlag,
            dueTimestamp - duration,
            lenderBalance,
            cosigner,
            dueTimestamp,
            rawPaid,
            0,
            rawAnnualInterest,
            rawAnnualPunitoryInterest
        );
    this.descriptor = new BasaltDescriptor(
            rawAnnualInterest,
            rawAnnualPunitoryInterest,
            rawAmount,
            duration
        );
    this.estimated = this.total - this.paid;
  }

  get isRequest() { return this.statusFlag === Status.Request; }

  get annualInterest(): number {
    return Utils.formatInterest(this.rawAnnualInterest);
  }

  get annualPunitoryInterest(): number {
    return Utils.formatInterest(this.rawAnnualPunitoryInterest);
  }

  get total(): number {
    function timestamp() { return (new Date().getTime() / 1000); }
    function calculateInterest(timeDelta: number, interestRate: number, amount: number): number {
      return (amount * 100000 * timeDelta) / interestRate;
    }
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
}

export class DiasporeDescriptor implements Descriptor {
  constructor(
        private requested: number,
        private punitiveInterestRate: number,
        private estimated: number,
        private duration: number
    ) {}
  getInterestRate(): string {
    const a = (this.estimated - this.requested) / this.estimated * 100;
    const i = (a / this.duration) * 31104000;
    return i.toPrecision(2);
  }
  getPunitiveInterestRate(): string {
    return Utils.formatInterest(this.punitiveInterestRate).toPrecision(2);
  }
  getEstimatedReturn(): number {
    return this.estimated;
  }
  getDuration(): number {
    return this.duration;
  }
}
