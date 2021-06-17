import { Currency } from '../utils/currencies';
import { Collateral } from './collateral.model';

export enum Status { Request, Ongoing, Paid, Destroyed, Expired, Indebt }

export enum LoanType {
  Unknown,
  UnknownWithCollateral,
  NftCollateral,
  FintechOriginator
}

export enum Engine {
  RcnEngine = 'rcnEngine',
  UsdcEngine = 'usdcEngine'
}

export class Descriptor {
  constructor(
    public firstObligation: number,
    public totalObligation: number,
    public duration: number,
    public interestRate: number,
    public punitiveInterestRate: number,
    public frequency: number,
    public installments: number
  ) { }
}

export class Model {
  constructor(
    public address: string,
    public paid: number,
    public nextObligation: number,
    public currentObligation: number,
    public estimatedObligation: number,
    public dueTime: number
  ) { }
}

export class Oracle {
  constructor(
    public address: string,
    public currency: string,
    public code: string
  ) { }
  toString = (): string => this.address;
}

export class Debt {
  constructor(
    public id: string,
    public model: Model,
    public balance: number,
    public creator: string,
    public owner: string,
    public oracle?: Oracle
  ) { }
}

export class Config {
  constructor(
    public installments: number,
    public timeUnit: number,
    public duration: number,
    public lentTime: number,
    public cuota: number,
    public interestRate: number
  ) { }
}

export class Loan {
  constructor(
    public engine: Engine,
    public id: string,
    public address: string,
    public amount: number,
    public oracle: Oracle,
    public descriptor: Descriptor,
    public borrower: string,
    public creator: string,
    public _status: Status,
    public expiration: number,
    public model: string,
    public cosigner?: string,
    public debt?: Debt,
    public config?: Config,
    public collateral?: Collateral,
    public position?: number,
    public poh?: boolean | string
  ) {}

  get isRequest(): boolean {
    return this.debt === undefined;
  }

  get currency(): Currency {
    const DEFAULT_CURRENCY = this.engine === Engine.RcnEngine ? 'RCN' : 'USDC';
    return new Currency(this.oracle ? this.oracle.currency : DEFAULT_CURRENCY);
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
