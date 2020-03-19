export interface CollateralApi {
  id: string;
  debt_id: string;
  oracle: string;
  token: string;
  amount: string;
  liquidation_ratio: string;
  balance_ratio: string;
}
