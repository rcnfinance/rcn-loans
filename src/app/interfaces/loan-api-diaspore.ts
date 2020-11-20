import { CollateralApi } from './collateral-api';

export interface LoanDescriptor {
  loan_id: string;
  first_obligation: number;
  total_obligation: number;
  duration: number;
  interest_rate: number;
  punitive_interest_rate: number;
  frequency: number;
  installments: number;
}

export interface LoanConfig {
  cuota: string;
  duration: string;
  installments: string;
  interest_rate: string;
  lent_time: string;
  time_unit: string;
}

export interface LoanDebt {
  debt_id: string;
  error: boolean;
  balance: string;
  model: string;
  creator: string;
  oracle: string;
  created: string;
  owner: string;
}

export interface LoanState {
  clock: string;
  interest: string;
  last_payment: string;
  paid: string;
  paid_base: string;
  status: string;
}

export interface LoanInstallments {
  installments_id: string;
  status: string;
  clock: string;
  last_payment: string;
  paid: string;
  paid_base: string;
  installments: string;
  time_unit: string;
  duration: string;
  lent_time: string;
  cuota: string;
  interest_rate: string;
  interest: string;
}

export interface LoanData {
  loan_id: string;
  open: boolean;
  approved: boolean;
  expiration: number;
  amount: number;
  cosigner: string;
  model: string;
  oracle: string;
  borrower: string;
  loanData: string;
  created: number;
  status: number;
  canceled: boolean;
  currency: string;
}

export interface LoanContentApi {
  loan: LoanData;
  debt: LoanDebt;
  installments: LoanInstallments;
  collateral: CollateralApi;
  descriptor: LoanDescriptor;
}
