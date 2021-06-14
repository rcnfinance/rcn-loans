import {} from 'jasmine';
import { APP_BASE_HREF } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { LoanListComponent } from './loan-list.component';
import { readComponent, LOAN_EXAMPLE_REQUESTED, LOAN_EXAMPLE_ONGOING, LOAN_EXAMPLE_COLLATERAL_PENDING, LOAN_EXAMPLE_PAID } from '../../utils/utils.test';
import { Loan } from '../../models/loan.model';

describe('LoanListComponent', () => {
  let component: LoanListComponent;
  let fixture: ComponentFixture<LoanListComponent>;

  const doTests = (loan: Loan, currency: string, amount: string, debt: string) => {
    component.loan = loan;
    component.ngOnInit();
    fixture.detectChanges();

    expect(readComponent(fixture, 'app-detail-button')).toBeDefined();

    expect(
      readComponent(fixture, '.loan-list__column--currency span').innerText
    ).toBe(currency);

    expect(
      readComponent(
        fixture,
        '.loan-list__column--amount .loan-list__column-amount'
      ).innerText
    ).toBe(amount);

    expect(
      readComponent(
        fixture,
        '.loan-list__column--debt .loan-list__column-amount'
      ).innerText
    ).toBe(debt);
  };

  beforeEach(() => {
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a request loan', () => {
    doTests(LOAN_EXAMPLE_REQUESTED, 'RCN', '10.00', '2.00');
  });

  it('should render an ongoing loan', () => {
    doTests(LOAN_EXAMPLE_ONGOING, 'USDC', '0.00', '10.05');
  });

  it('should render a pending collateral loan', () => {
    doTests(LOAN_EXAMPLE_COLLATERAL_PENDING, 'RCN', '10.00', '2.00');
  });

  it('should render a paid loan', () => {
    doTests(LOAN_EXAMPLE_PAID, 'RCN', '7.10', '0.00');
  });

});
