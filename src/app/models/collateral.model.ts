export class Collateral {
  constructor(
    public id: number,
    public debtId: string,
    public oracle: string,
    public token: string,
    public amount: number,
    public liquidationRatio: number,
    public balanceRatio: number,
    public burnFee: number,
    public rewardFee: number
  ) {}
}
