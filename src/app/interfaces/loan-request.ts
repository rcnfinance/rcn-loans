export interface LoanRequest {
  amount: number;
  model: string;
  oracle: string;
  account: string;
  callback: string;
  salt: string;
  expiration: number;
  encodedData: string;
}
