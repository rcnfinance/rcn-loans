import { Currency } from '../utils/currencies';

export enum Status { Request, Ongoing, Paid, Destroyed, Expired, Indebt }

export enum Network {
  Basalt = 2,
  Diaspore = 4
}

export class Descriptor {
  constructor(
    public network: Network,
    public firstObligation: number,
    public totalObligation: number,
    public duration: number,
    public interestRate: number,
    public punitiveInterestRateRate: number,
    public frequency: number,
    public installments: number
  ) { }
}

export class Model {
  constructor(
    public network: Network,
    public address: string,
    public paid: number,
    public nextObligation: number,
    public currentObligation: number,
    public estimatedObliation: number,
    public dueTime: number
  ) { }
}

export class Oracle {
  constructor(
    public network: Network,
    public address: string,
    public currency: string,
    public code: string
  ) { }
  toString = (): string => this.address;
}

export class Debt {
  constructor(
    public network: Network,
    public id: string,
    public model: Model,
    public balance: number,
    public creator: string,
    public owner: string,
    public oracle?: Oracle
  ) { }
}

export class Loan {
  constructor(
    public network: Network,
    public id: string,
    public address: string,
    public amount: number,
    public oracle: Oracle,
    public descriptor: Descriptor,
    public borrower: string,
    public creator: string,
    public _status: Status,
    public expiration: number,
    public cosigner?: string,
    public debt?: Debt
  ) {}

  get isRequest(): boolean {
    return this.debt === undefined;
  }

  get currency(): Currency {
    return new Currency(this.oracle ? this.oracle.currency : 'RCN');
  }

  get status(): Status {
    if (this._status === Status.Request && this.expiration < new Date().getTime() / 1000) {
      return Status.Expired;
    }

    if (this._status === Status.Ongoing && this.debt.model.dueTime < new Date().getTime() / 1000) {
      return Status.Indebt;
    }

    return this._status;
  }
}
