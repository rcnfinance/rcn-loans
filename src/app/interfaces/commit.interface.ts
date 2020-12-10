export interface Commit {
  nonce: number;
  id_loan: string;
  opcode: CommitTypes;
  timestamp: string;
  tx_hash: string;
  data: any;
}

export enum CommitTypes {
  Requested = 'LoanManager_Requested',
  Lent = 'LoanManager_Lent',
  Paid = 'DebtEngine_Paid',
  PaidBase = 'Installments_SetPaidBase',
  FullyPaid = 'LoanManager_FullPayed',
  Withdraw = 'DebtEngine_Withdrawn'
}

export enum CommitProperties {
  Balance = 'balance',
  Creator = 'creator',
  Lender = 'lender',
  Paid = 'paid',
  PaidBase = 'paid_base'
}
