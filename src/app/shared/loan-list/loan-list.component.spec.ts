import {} from 'jasmine';
import { APP_BASE_HREF } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { LoanListComponent } from './loan-list.component';
import { readComponent, LOAN_EXAMPLE_REQUESTED, LOAN_EXAMPLE_ONGOING } from '../../utils/utils.test';

describe('LoanListComponent', () => {
  let component: LoanListComponent;
  let fixture: ComponentFixture<LoanListComponent>;

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
    fixture = TestBed.createComponent(LoanListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a request loan', () => {
    component.loan = LOAN_EXAMPLE_REQUESTED;
    fixture.detectChanges();

    const detailButton = readComponent(fixture, 'app-detail-button');
    expect(detailButton).toBeDefined();

    const currencyLabel = readComponent(
      fixture,
      '.loan-list__column--currency span'
    );
    expect(currencyLabel.innerText).toBe('RCN');

    expect(
      readComponent(
        fixture,
        '.loan-list__column--amount .loan-list__column-amount'
      ).innerText
    ).toBe('10.00');

    expect(
      readComponent(
        fixture,
        '.loan-list__column--debt .loan-list__column-amount'
      ).innerText
    ).toBe('2.00');
  });

  it('should render an ongoing loan', () => {
    component.loan = LOAN_EXAMPLE_ONGOING;
    fixture.detectChanges();

    const lendButton = readComponent(fixture, 'app-lend-button');
    expect(lendButton).toBeFalsy();

    const detailButton = readComponent(fixture, 'app-detail-button');
    expect(detailButton).toBeDefined();

    const currencyLabel = readComponent(
      fixture,
      '.loan-list__column--currency span'
    );
    expect(currencyLabel.innerText).toBe('USDC');

    expect(
      readComponent(
        fixture,
        '.loan-list__column--amount .loan-list__column-amount'
      ).innerText
    ).toBe('0.00');

    expect(
      readComponent(
        fixture,
        '.loan-list__column--debt .loan-list__column-amount'
      ).innerText
    ).toBe('10.05');
  });

});
