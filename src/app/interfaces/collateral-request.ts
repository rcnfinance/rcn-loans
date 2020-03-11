export interface CollateralRequest {
  debtId: string;
  oracle: string;
  amount: string;
  liquidationRatio: string;
  balanceRatio: string;
}
