export interface LoanApiDiaspore {
  id: string;
  open: boolean;
  approved: boolean;
  position: number;
  expiration: number;
  amount: number;
  cosigner: string;
  model: string;
  creator: string;
  oracle: string;
  borrower: string;
  callback: string;
  salt: number;
  loanData: string;
  created: number;
  descriptor: {
    first_obligation: number;
    total_obligation: number;
    duration: number;
    interest_rate: number;
    punitive_interest_rate: number;
    frequency: number;
    installments: number;
  };
  currency: string;
  lender: string;
  status: number;
  canceled: boolean;
}
