import * as BN from 'bn.js';

export interface LoanRequest {
  amount: string | BN;
  model: string;
  oracle: string;
  account: string;
  callback: string;
  salt: string;
  expiration: number;
  encodedData: string;
}
