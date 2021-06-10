import {} from 'jasmine';
import { Loan, Engine, Status } from 'app/models/loan.model';
import { ComponentFixture } from '@angular/core/testing';

export const LOAN_EXAMPLE_COLLATERAL_PENDING = new Loan(
  Engine.UsdcEngine,
  '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
  '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
  11000000000000000000,
  {
    address: '0x0000000000000000000000000000000000000000',
    currency: 'RCN',
    code: '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  {
    firstObligation: 1000000000000000000,
    totalObligation: 12000000000000000000,
    duration: 31104000,
    interestRate: 9.048821548821541,
    punitiveInterestRate: 11.976896418944936,
    frequency: 2592000,
    installments: 12
  },
  '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
  '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
  Status.Request,
  1677953062,
  '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
  '0x0000000000000000000000000000000000000000',
  {
    id: '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
    model: {
      address: '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
      paid: 10000000000000000000,
      nextObligation: 1000000000000000000,
      currentObligation: 0,
      estimatedObligation: 2000000000000000000,
      dueTime: 1580148440
    },
    balance: 6000000000000000000,
    creator: '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
    owner: '0xA5823617776f816e4AD1a26cb51Df2eF9458D0EA',
    oracle: {
      address: '0x0000000000000000000000000000000000000000',
      currency: 'RCN',
      code: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }
  }
);

export const LOAN_EXAMPLE_REQUESTED = new Loan(
  Engine.UsdcEngine,
  '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
  '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
  11000000000000000000,
  {
    address: '0x0000000000000000000000000000000000000000',
    currency: 'RCN',
    code: '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  {
    firstObligation: 1000000000000000000,
    totalObligation: 12000000000000000000,
    duration: 31104000,
    interestRate: 9.048821548821541,
    punitiveInterestRate: 11.976896418944936,
    frequency: 2592000,
    installments: 12
  },
  '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
  '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
  Status.Request,
  1677953062,
  '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
  '0x0000000000000000000000000000000000000000',
  {
    id: '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
    model: {
      address: '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
      paid: 10000000000000000000,
      nextObligation: 1000000000000000000,
      currentObligation: 0,
      estimatedObligation: 2000000000000000000,
      dueTime: 1580148440
    },
    balance: 6000000000000000000,
    creator: '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
    owner: '0xA5823617776f816e4AD1a26cb51Df2eF9458D0EA',
    oracle: {
      address: '0x0000000000000000000000000000000000000000',
      currency: 'RCN',
      code: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }
  }
);

export const LOAN_EXAMPLE_ONGOING = new Loan(
  Engine.UsdcEngine,
  '0x855e7d59063408d7c6d61c6d7d09b84ad40651752af7a8c18075838f673fb223',
  '0x855e7d59063408d7c6d61c6d7d09b84ad40651752af7a8c18075838f673fb223',
  10000000,
  {
    address: '0x0000000000000000000000000000000000000000',
    currency: 'USDC',
    code: '0x5553444300000000000000000000000000000000000000000000000000000000'
  },
  {
    firstObligation: 10058333,
    totalObligation: 10058333,
    duration: 2592000,
    interestRate: 7,
    punitiveInterestRate: 7.00000210000063,
    frequency: 2592000,
    installments: 1
  },
  '0x6b800281ca137fE073c662e34440420E91F43DeB',
  '0x6b800281ca137fE073c662e34440420E91F43DeB',
  Status.Ongoing,
  1619458679,
  '0x1BeC6dE76544Ab982C4A137136d15a0b6D9398A4',
  '0x6b800281ca137fE073c662e34440420E91F43DeB',
  {
    id: '0x855e7d59063408d7c6d61c6d7d09b84ad40651752af7a8c18075838f673fb223',
    model: {
      address: '0x1BeC6dE76544Ab982C4A137136d15a0b6D9398A4',
      paid: 0,
      nextObligation: 10058333,
      currentObligation: 10058333,
      estimatedObligation: 10058333,
      dueTime: 1000000000000000000
    },
    balance: 0,
    creator: '0x3938155d5782b83cbf23fc325a19746ad7d6ba43',
    owner: '0xFbf6f39e0a7FA22aB5706dBA401633237134BCDD',
    oracle: {
      address: '0x0000000000000000000000000000000000000000',
      currency: 'USDC',
      code: '0x5553444300000000000000000000000000000000000000000000000000000000'
    }
  },
  {
    installments: 1,
    timeUnit: 86400,
    duration: 2592000,
    lentTime: 1619027076,
    cuota: 10058333,
    interestRate: 44434272384000
  },
  {
    id: 74,
    debtId:
      '0x855e7d59063408d7c6d61c6d7d09b84ad40651752af7a8c18075838f673fb223',
    oracle: '0x8Bf504B1309ea4029aAD96f8Cc2a6F2e6bcAc391',
    token: '0x2f45b6Fb2F28A73f110400386da31044b2e953D4',
    amount: '754389999999999900000',
    liquidationRatio: '6442450944',
    balanceRatio: '8589934592',
    status: 2
  },
  null,
  null
);

export const LOAN_EXAMPLE_EXPIRED = new Loan(
  Engine.RcnEngine,
  '0xa6035b1132cd96126b2e24b330e53a1b563a5d229a833d17ab957f749ee7f798',
  '0x3938155d5782b83cbf23fc325a19746ad7d6ba43',
  2000000000000000000,
  {
    address: '0x8Bf504B1309ea4029aAD96f8Cc2a6F2e6bcAc391',
    currency: 'RCN',
    code: '0x52434e0000000000000000000000000000000000000000000000000000000000'
  },
  {
    firstObligation: 2050000000000000000,
    totalObligation: 2050000000000000000,
    duration: 7776000,
    interestRate: 10,
    punitiveInterestRate: 10,
    frequency: 7776000,
    installments: 1
  },
  '0xFbf6f39e0a7FA22aB5706dBA401633237134BCDD',
  '0xFbf6f39e0a7FA22aB5706dBA401633237134BCDD',
  0,
  1620663625,
  '0x1BeC6dE76544Ab982C4A137136d15a0b6D9398A4',
  '0x0000000000000000000000000000000000000000',
  null,
  null,
  null,
  1,
  null
);

export const LOAN_EXAMPLE_PAID = new Loan(
  Engine.UsdcEngine,
  '0xad1c40fd483dc752d5843ec742686814e47ff483928e29ff6edd067f2ed697e3',
  '0x3938155d5782b83cbf23fc325a19746ad7d6ba43',
  7000000000000000000,
  {
    address: '0x8Bf504B1309ea4029aAD96f8Cc2a6F2e6bcAc391',
    currency: 'RCN',
    code: '0x52434e0000000000000000000000000000000000000000000000000000000000'
  },
  {
    firstObligation: 1183739508195919400,
    totalObligation: 7102437049175516000,
    duration: 7776000,
    interestRate: 10,
    punitiveInterestRate: 10,
    frequency: 1296000,
    installments: 6
  },
  '0xFbf6f39e0a7FA22aB5706dBA401633237134BCDD',
  '0xFbf6f39e0a7FA22aB5706dBA401633237134BCDD',
  2,
  1620568404,
  '0x1BeC6dE76544Ab982C4A137136d15a0b6D9398A4',
  '0xE404A7a3Bf4B0aD2d18865de2064c78e255814d1',
  {
    id: '0xad1c40fd483dc752d5843ec742686814e47ff483928e29ff6edd067f2ed697e3',
    model: {
      address: '0x1BeC6dE76544Ab982C4A137136d15a0b6D9398A4',
      paid: 7102437049175516000,
      nextObligation: 0,
      currentObligation: 0,
      estimatedObligation: 0,
      dueTime: 1627913235
    },
    balance: 236753,
    creator: '0x3938155d5782b83cbf23fc325a19746ad7d6ba43',
    owner: '0x0E273F30002c0C5d8CC5fc9be29eD173d812d109',
    oracle: {
      address: '0x8Bf504B1309ea4029aAD96f8Cc2a6F2e6bcAc391',
      currency: 'RCN',
      code: '0x52434e0000000000000000000000000000000000000000000000000000000000'
    }
  },
  {
    installments: 6,
    timeUnit: 86400,
    duration: 1296000,
    lentTime: 1620137235,
    cuota: 1183739508195919400,
    interestRate: 31104000000000
  },
  {
    id: 79,
    debtId:
      '0xad1c40fd483dc752d5843ec742686814e47ff483928e29ff6edd067f2ed697e3',
    oracle: '0x0000000000000000000000000000000000000000',
    token: '0x99c1C36DEe5C3B62723DC4223F4352bBf1Da0BfF',
    amount: '12600000',
    liquidationRatio: '6442450944',
    balanceRatio: '8589934592',
    status: 4
  },
  5,
  null
);

export function readComponent(e: ComponentFixture<any>, s: string, i = 0): HTMLElement {
  const r = e.debugElement.nativeElement.querySelectorAll(s);
  return r[i];
}
