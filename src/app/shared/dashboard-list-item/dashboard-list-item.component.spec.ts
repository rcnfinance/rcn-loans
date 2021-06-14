import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DashboardListItemComponent } from './dashboard-list-item.component';
import { MaterialModule } from '../..//material.module';
import { InstallmentsService } from '../../services/installments.service';
import {
  readComponent,
  LOAN_EXAMPLE_COLLATERAL_PENDING,
  LOAN_EXAMPLE_REQUESTED,
  LOAN_EXAMPLE_ONGOING,
  LOAN_EXAMPLE_PAID,
  LOAN_EXAMPLE_EXPIRED
} from '../../utils/utils.test';
import { Loan } from '../../models/loan.model';

describe('DashboardListItemComponent', () => {
  let component: DashboardListItemComponent;
  let fixture: ComponentFixture<DashboardListItemComponent>;

  const doStatusTests = (
    loan: Loan,
    statusText: string,
    statusIcon: string,
    statusColor: string,
    isCurrentLoans = false
  ) => {
    component.loan = loan;
    component.isCurrentLoans = isCurrentLoans;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.statusText).toEqual(statusText);
    expect(component.statusIcon).toEqual(statusIcon);
    expect(component.statusColor).toEqual(statusColor);
  };

  const doComponentTests = (
    loan: Loan,
    lent: string,
    borrowed: string,
    repaid: string,
    interest: string,
    anualRate: string,
    accruedInterest: string
  ) => {
    component.loan = loan;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.lent).toEqual(lent);
    expect(component.borrowed).toEqual(borrowed);
    expect(component.repaid).toEqual(repaid);
    expect(component.interest).toEqual(interest);
    expect(component.anualRate).toEqual(anualRate);
    expect(component.accruedInterest).toEqual(accruedInterest);
  };

  const doRenderTests = (loan: Loan) => {
    component.loan = loan;
    component.isBorrowed = true;
    component.ngOnInit();
    fixture.detectChanges();

    expect(readComponent(fixture, '.test-label-borrowed').innerText).toBe(component.borrowed);
    expect(readComponent(fixture, '.test-label-repaid').innerText).toBe(component.repaid);
    expect(readComponent(fixture, '.test-label-annualrate').innerText).toBe(component.anualRate);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, HttpClientModule, RouterModule.forRoot([])],
      declarations: [DashboardListItemComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [InstallmentsService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardListItemComponent);
    component = fixture.componentInstance;
    component.loan = LOAN_EXAMPLE_COLLATERAL_PENDING;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be return the correct status of a ongoing loan', () => {
    doStatusTests(
      LOAN_EXAMPLE_ONGOING,
      'Ongoing',
      'angle-double-up',
      '#4155FF'
    );
  });

  it('should be return the correct basic data of a ongoing loan', () => {
    doComponentTests(LOAN_EXAMPLE_ONGOING, '10.00 USDC', '10.00 USDC', '0.00 USDC', '0.0583 USDC', '7%', '0.00 USDC');
  });

  it('should be return the correct status of a requested loan without collateral', () => {
    doStatusTests(
      LOAN_EXAMPLE_COLLATERAL_PENDING,
      'Collateral Pending',
      'exclamation',
      '#EAA219'
    );
  });

  it('should be return the correct basic data of a requested loan without collateral', () => {
    doComponentTests(LOAN_EXAMPLE_COLLATERAL_PENDING, '11.00 RCN', '11.00 RCN', '-', '-', '9.048821548821541%', '0.00 RCN');
  });

  it('should be return the correct status of a requested loan', () => {
    doStatusTests(
      LOAN_EXAMPLE_REQUESTED,
      'Requested',
      'calendar',
      '#FFFFFF',
      true
    );
  });

  it('should be return the correct basic data of a requested loan', () => {
    doComponentTests(LOAN_EXAMPLE_REQUESTED, '11.00 RCN', '11.00 RCN', '-', '-', '9.048821548821541%', '0.00 RCN');
  });

  it('should be return the correct status of a expired loan', () => {
    doStatusTests(LOAN_EXAMPLE_EXPIRED, 'Expired', 'times', '#A3A5A6', true);
  });

  it('should be return the correct basic data of a expired loan', () => {
    doComponentTests(LOAN_EXAMPLE_EXPIRED, '2.00 RCN', '2.00 RCN', '-', '-', '10%', '0.00 RCN');
  });

  it('should be return the correct status of a payed loan', () => {
    doStatusTests(LOAN_EXAMPLE_PAID, 'Fully Repaid', 'check', '#59B159', true);
  });

  it('should be return the correct basic data of a payed loan', () => {
    doComponentTests(LOAN_EXAMPLE_PAID, '7.00 RCN', '7.00 RCN', '7.10 RCN', '0.1024 RCN', '10%', '0.10 RCN');
  });

  it('should display borrowed label', () => {
    doRenderTests(LOAN_EXAMPLE_PAID);
  });
});
