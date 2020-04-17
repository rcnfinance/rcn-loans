import * as BN from 'bn.js';

export enum Status {
  Created = 1,
  Started,
  InAuction,
  ToWithdraw,
  Finish
}

export class Collateral {
  constructor(
    public id: number,
    public debtId: string,
    public oracle: string,
    public token: string,
    public amount: string | BN,
    public liquidationRatio: string | BN,
    public balanceRatio: string | BN,
    public status: Status
  ) {}
}
