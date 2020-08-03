import {} from 'jasmine';
import { APP_BASE_HREF } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { Loan } from '../../models/loan.model';
import { LoanCardComponent } from './loan-card.component';
import { readComponent } from '../../utils/utils.test';

describe('LoanCardComponent', () => {
  let component: LoanCardComponent;
  let fixture: ComponentFixture<LoanCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        SharedModule
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        {
          provide: APP_BASE_HREF, useValue: '/'
        },
        Web3Service,
        ContractsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCardComponent);
    component = fixture.componentInstance;
  });

  it('should render a request loan', () => {
    const loan = new Loan(
      4,
      '0xd1c9866cbd3e57fdf025e7a2eef568d834a64f5f341a550e9b19714bfbcef27b',
      '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
      8.48592e+22,
      {
        'network': 4,
        'address': '0x0000000000000000000000000000000000000000',
        'currency': 'RCN',
        'code': '0x0000000000000000000000000000000000000000000000000000000000000000'
      },
      {
        'network': 4,
        'firstObligation': 3.408e+22,
        'totalObligation': 1.0224e+23,
        'duration': 5854446,
        'interestRate': 108.31434467543319,
        'punitiveInterestRateRate': 79.00017380038236,
        'frequency': 1951482,
        'installments': 3
      },
      '0x8a9FB40D5e4510650FEb2f528DbE86242F64b69e',
      '0x8a9FB40D5e4510650FEb2f528DbE86242F64b69e',
      1,
      1687856143,
      '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
      '0x0000000000000000000000000000000000000000'
    );

    component.loan = loan;
    fixture.detectChanges();

    const detailButton = readComponent(fixture, 'app-detail-button');
    expect(detailButton).toBeDefined();

    const currencyLabel = readComponent(
      fixture,
      '.loan-card__property--properties .loan-card__property-currency'
    );
    expect(currencyLabel.innerText).toBe('RCN');

    expect(
      readComponent(
        fixture,
        '.loan-card__property--conversion .loan-card__property-title',
        0
      ).innerText
    ).toBe('84,859.20');

    expect(
      readComponent(
        fixture,
        '.loan-card__property--conversion .loan-card__property-title',
        1
      ).innerText
    ).toBe('102,240.00');
  });

  it('should render an ongoing loan', () => {
    const loan = new Loan(
      4,
      '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
      '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
      11000000000000000000,
      {
        'network': 4,
        'address': '0x0000000000000000000000000000000000000000',
        'currency': 'RCN',
        'code': '0x0000000000000000000000000000000000000000000000000000000000000000'
      },
      {
        'network': 4,
        'firstObligation': 1000000000000000000,
        'totalObligation': 12000000000000000000,
        'duration': 31104000,
        'interestRate': 9.048821548821541,
        'punitiveInterestRateRate': 11.976896418944936,
        'frequency': 2592000,
        'installments': 12
      },
      '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
      '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
      1,
      1677953062,
      '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
      '0x0000000000000000000000000000000000000000',
      {
        'network' : 4,
        'id' : '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
        'model' : {
          'network' : 4,
          'address' : '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
          'paid' : 10000000000000000000,
          'nextObligation' : 1000000000000000000,
          'currentObligation' : 0,
          'estimatedObligation' : 2000000000000000000,
          'dueTime' : 1580148440
        },
        'balance' : 6000000000000000000,
        'creator' : '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
        'owner' : '0xA5823617776f816e4AD1a26cb51Df2eF9458D0EA',
        'oracle' : {
          'network' : 4,
          'address' : '0x0000000000000000000000000000000000000000',
          'currency' : 'RCN',
          'code' : '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
      }
    );

    component.loan = loan;
    fixture.detectChanges();

    const lendButton = readComponent(fixture, 'app-lend-button');
    expect(lendButton).toBeFalsy();

    const detailButton = readComponent(fixture, 'app-detail-button');
    expect(detailButton).toBeDefined();

    const currencyLabel = readComponent(
      fixture,
      '.loan-card__property--properties .loan-card__property-currency'
    );
    expect(currencyLabel.innerText).toBe('RCN');

    expect(
      readComponent(
        fixture,
        '.loan-card__property--conversion .loan-card__property-title',
        0
      ).innerText
    ).toBe('10.00');

    expect(
      readComponent(
        fixture,
        '.loan-card__property--conversion .loan-card__property-title',
        1
      ).innerText
    ).toBe('2.00');
  });
});
