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

describe('DashboardListItemComponent', () => {
  let component: DashboardListItemComponent;
  let fixture: ComponentFixture<DashboardListItemComponent>;

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
    component.loan = LOAN_EXAMPLE_ONGOING;
    component.ngOnInit();
    expect(component.statusText).toEqual('Ongoing');
    expect(component.statusIcon).toEqual('angle-double-up');
    expect(component.statusColor).toEqual('#4155FF');
  });

  it('should be return the correct basic data of a ongoing loan', () => {
    component.loan = LOAN_EXAMPLE_ONGOING;
    component.ngOnInit();
    expect(component.lent).toEqual('10.00 USDC');
    expect(component.borrowed).toEqual('10.00 USDC');
    expect(component.repaid).toEqual('0.00 USDC');
    expect(component.interest).toEqual('0.0583 USDC');
    expect(component.anualRate).toEqual('7%');
    expect(component.accruedInterest).toEqual('0.00 USDC');
  });

  it('should be return the correct status of a requested loan without collateral', () => {
    component.loan = LOAN_EXAMPLE_COLLATERAL_PENDING;
    component.ngOnInit();
    expect(component.statusText).toEqual('Collateral Pending');
    expect(component.statusIcon).toEqual('exclamation');
    expect(component.statusColor).toEqual('#EAA219');
  });

  it('should be return the correct basic data of a requested loan without collateral', () => {
    component.loan = LOAN_EXAMPLE_COLLATERAL_PENDING;
    component.ngOnInit();
    expect(component.lent).toEqual('11.00 RCN');
    expect(component.borrowed).toEqual('11.00 RCN');
    expect(component.repaid).toEqual('-');
    expect(component.interest).toEqual('-');
    expect(component.anualRate).toEqual('9.048821548821541%');
    expect(component.accruedInterest).toEqual('0.00 RCN');
  });

  it('should be return the correct status of a requested loan', () => {
    component.loan = LOAN_EXAMPLE_REQUESTED;
    component.isCurrentLoans = true;
    component.ngOnInit();
    expect(component.statusText).toEqual('Requested');
    expect(component.statusIcon).toEqual('calendar');
    expect(component.statusColor).toEqual('#FFFFFF');
  });

  it('should be return the correct basic data of a requested loan', () => {
    component.loan = LOAN_EXAMPLE_REQUESTED;
    component.ngOnInit();
    expect(component.lent).toEqual('11.00 RCN');
    expect(component.borrowed).toEqual('11.00 RCN');
    expect(component.repaid).toEqual('-');
    expect(component.interest).toEqual('-');
    expect(component.anualRate).toEqual('9.048821548821541%');
    expect(component.accruedInterest).toEqual('0.00 RCN');
  });

  it('should be return the correct status of a expired loan', () => {
    component.loan = LOAN_EXAMPLE_EXPIRED;
    component.isCurrentLoans = true;
    component.ngOnInit();
    expect(component.statusText).toEqual('Expired');
    expect(component.statusIcon).toEqual('times');
    expect(component.statusColor).toEqual('#A3A5A6');
  });

  it('should be return the correct basic data of a expired loan', () => {
    component.loan = LOAN_EXAMPLE_EXPIRED;
    component.ngOnInit();
    expect(component.lent).toEqual('2.00 RCN');
    expect(component.borrowed).toEqual('2.00 RCN');
    expect(component.repaid).toEqual('-');
    expect(component.interest).toEqual('-');
    expect(component.anualRate).toEqual('10%');
    expect(component.accruedInterest).toEqual('0.00 RCN');
  });

  it('should be return the correct status of a payed loan', () => {
    component.loan = LOAN_EXAMPLE_PAID;
    component.isCurrentLoans = true;
    component.ngOnInit();
    expect(component.statusText).toEqual('Fully Repaid');
    expect(component.statusIcon).toEqual('check');
    expect(component.statusColor).toEqual('#59B159');
  });

  it('should be return the correct basic data of a payed loan', () => {
    component.loan = LOAN_EXAMPLE_PAID;
    component.ngOnInit();
    expect(component.lent).toEqual('7.00 RCN');
    expect(component.borrowed).toEqual('7.00 RCN');
    expect(component.repaid).toEqual('7.10 RCN');
    expect(component.interest).toEqual('0.1024 RCN');
    expect(component.anualRate).toEqual('10%');
    expect(component.accruedInterest).toEqual('0.10 RCN');
  });

  it('should display borrowed label', () => {
    component.loan = LOAN_EXAMPLE_PAID;
    component.isBorrowed = true;
    component.ngOnInit();
    fixture.detectChanges();
    const label = readComponent(fixture, '.test-label-borrowed');
    expect(label.innerText).toBe(component.borrowed);
  });

  it('should display repaid label', () => {
    component.loan = LOAN_EXAMPLE_PAID;
    component.isBorrowed = true;
    component.ngOnInit();
    fixture.detectChanges();
    const label = readComponent(fixture, '.test-label-repaid');
    expect(label.innerText).toBe(component.repaid);
  });

  it('should display annual rate label', () => {
    component.loan = LOAN_EXAMPLE_PAID;
    component.isBorrowed = true;
    component.ngOnInit();
    fixture.detectChanges();
    const label = readComponent(fixture, '.test-label-annualrate');
    expect(label.innerText).toBe(component.anualRate);
  });
});
