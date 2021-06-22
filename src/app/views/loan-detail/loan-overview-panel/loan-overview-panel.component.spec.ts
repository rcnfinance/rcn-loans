import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { LoanOverviewPanelComponent } from './loan-overview-panel.component';
import {
  readComponent,
  LOAN_EXAMPLE_REQUESTED,
  LOAN_EXAMPLE_ONGOING,
  LOAN_EXAMPLE_COLLATERAL_PENDING,
  LOAN_EXAMPLE_PAID,
  LOAN_EXAMPLE_EXPIRED
} from '../../../utils/utils.test';
import { Loan } from '../../../models/loan.model';

describe('LoanOverviewComponent', () => {
  let component: LoanOverviewPanelComponent;
  let fixture: ComponentFixture<LoanOverviewPanelComponent>;

  const doTests = (loan: Loan, borrow: string, repay: string, interest: string) => {
    component.loan = loan;
    component.ngOnInit();
    fixture.detectChanges();

    expect(readComponent(fixture, '.page-content__borrow').innerText).toBe(
      borrow
    );
    expect(readComponent(fixture, '.page-content__repay').innerText).toBe(
      repay
    );
    expect(readComponent(fixture, '.page-content__interestrate').innerText).toBe(
      interest
    );
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, BrowserAnimationsModule, SharedModule],
      declarations: [LoanOverviewPanelComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanOverviewPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a request loan', () => {
    doTests(LOAN_EXAMPLE_REQUESTED, '11.00 RCN', '12.00 RCN', '9 %');
  });

  it('should render an ongoing loan', () => {
    doTests(LOAN_EXAMPLE_ONGOING, '10.00 USDC', '10.05 USDC', '7 %');
  });

  it('should render a collateral pending loan', () => {
    doTests(LOAN_EXAMPLE_COLLATERAL_PENDING, '11.00 RCN', '12.00 RCN', '9 %');
  });

  it('should render a paid loan', () => {
    doTests(LOAN_EXAMPLE_PAID, '7.00 RCN', '7.10 RCN', '10 %');
  });

  it('should render an expired loan', () => {
    doTests(LOAN_EXAMPLE_EXPIRED, '2.00 RCN', '2.05 RCN', '10 %');
  });
});
