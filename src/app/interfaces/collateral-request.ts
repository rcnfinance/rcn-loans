export interface CollateralRequest {
  loanId: string;
  oracle: string;
  collateralToken: string;
  collateralAmount: number;
  liquidationRatio: number;
  balanceRatio: number;
  burnFee: number;
  rewardFee: number;
  account: string;
}
