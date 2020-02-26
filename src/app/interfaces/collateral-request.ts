import * as BN from 'bn.js';

export interface CollateralRequest {
  loanId: string;
  oracle: string;
  collateralToken: string;
  collateralAmount: string | BN;
  liquidationRatio: string | BN;
  balanceRatio: string | BN;
  burnFee: string | BN;
  rewardFee: string | BN;
  account: string;
}
