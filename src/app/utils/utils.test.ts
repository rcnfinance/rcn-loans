import {} from 'jasmine';
import { Loan, Engine, Status } from 'app/models/loan.model';
import { ComponentFixture } from '@angular/core/testing';

export const LOAN_EXAMPLE_REQUESTED = new Loan(
  Engine.RcnEngine,
  '0xd1c9866cbd3e57fdf025e7a2eef568d834a64f5f341a550e9b19714bfbcef27b',
  '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
  8.48592e+22,
  {
    'address': '0x0000000000000000000000000000000000000000',
    'currency': 'RCN',
    'code': '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  {
    'firstObligation': 3.408e+22,
    'totalObligation': 1.0224e+23,
    'duration': 5854446,
    'interestRate': 108.31434467543319,
    'punitiveInterestRate': 79.00017380038236,
    'frequency': 1951482,
    'installments': 3
  },
  '0x8a9FB40D5e4510650FEb2f528DbE86242F64b69e',
  '0x8a9FB40D5e4510650FEb2f528DbE86242F64b69e',
  Status.Request,
  1687856143,
  '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
  '0x0000000000000000000000000000000000000000'
);

export function readComponent(e: ComponentFixture<any>, s: string, i = 0): HTMLElement {
  const r = e.debugElement.nativeElement.querySelectorAll(s);
  return r[i];
}
