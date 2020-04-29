interface LoanDescriptor {
  first_obligation: number;
  total_obligation: number;
  duration: number;
  interest_rate: number;
  punitive_interest_rate: number;
  frequency: number;
  installments: number;
}

interface LoanConfig {
  cuota: string;
  duration: string;
  installments: string;
  interest_rate: string;
  lent_time: string;
  time_unit: string;
}

interface LoanDebt {
  balance: string;
  created: string;
  creator: string;
  error: boolean;
  model: string;
  oracle: string;
}

interface LoanState {
  clock: string;
  interest: string;
  last_payment: string;
  paid: string;
  paid_base: string;
  status: string;
}

export interface LoanApiDiaspore {
  id: string;
  open: boolean;
  approved: boolean;
  position: string;
  expiration: string;
  amount: string;
  cosigner: string;
  model: string;
  creator: string;
  oracle: string;
  borrower: string;
  callback: string;
  salt: string;
  loanData: string;
  created: string;
  config: LoanConfig;
  debt: LoanDebt;
  descriptor: LoanDescriptor;
  currency: string;
  lender: string;
  state: LoanState;
  status: string;
  canceled: boolean;
}
