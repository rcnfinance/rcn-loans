export enum LoanSortKey {
  FirstObligation = 'descriptor.first_obligation',
  TotalObligation = 'descriptor.total_obligation',
  Duration = 'descriptor.duration',
  InterestRate = 'descriptor.interest_rate',
  PunitiveInterestRate = 'descriptor.punitive_interest_rate',
  Frequency = 'descriptor.frequency',
  Installments = 'descriptor.installments',
  Expiration = 'expiration',
  Amount = 'amount',
  Created = 'created',
  Currency = 'currency'
}

export enum LoanSortValue {
  Asc = 'asc',
  Desc = 'desc'
}
