export interface CollateralApi {
  id: string;
  collateral_id: number;
  debt_id: string;
  oracle: string;
  token: string;
  liquidation_ratio: number;
  balance_ratio: number;
  burn_fee: number;
  reward_fee: number;
  owner: string;
  amount: number;
  status: number;
}
