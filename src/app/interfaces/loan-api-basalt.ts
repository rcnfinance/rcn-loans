export interface LoanApiBasalt {
  index: number;
  created: number;
  approved: boolean;
  status: number;
  oracle: string;
  borrower: string;
  lender?: string;
  creator: string;
  cosigner: string;
  amount: number;
  interest: number;
  punitory_interest: number;
  interest_timestamp: number;
  paid: number;
  interest_rate: number;
  interest_rate_punitory: number;
  due_time: number;
  dues_in: number;
  currency?: string;
  cancelable_at?: number;
  lender_balance: number;
  expiration_requests: number;
  approved_transfer: number;
}
