import {} from 'jasmine';

import { NO_ERRORS_SCHEMA } from '@angular/core';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Loan } from '../../models/loan.model';
import { LoanCardComponent } from './loan-card.component';
import { readComponent } from '../../utils/utils.test';

describe('BannerComponent', () => {
  let component: LoanCardComponent;
  let fixture: ComponentFixture<LoanCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanCardComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCardComponent);
    component = fixture.componentInstance;
  });

  it('should render a request loan', () => {
    const loan = new Loan(
      '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
      31,
      '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40',
      0,
      '0xe4d3ba99ffdae47c003f1756c01d8e7ee8fef7c9',
      '0x0679cde060990fb409cb19b4434714c1e5f2ae6e',
      9e+22,
      18418265,
      15552000000000,
      10367989632000,
      '0x4d414e4100000000000000000000000000000000000000000000000000000000',
      0,
      0,
      0,
      0,
      0,
      0,
      1528675200000,
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000'
    );

    component.loan = loan;
    fixture.detectChanges();

    const lendButton = readComponent(fixture, 'app-lend-button');
    expect(lendButton).toBeDefined();

    const detailButton = readComponent(fixture, 'app-detail-button');
    expect(detailButton).toBeDefined();

    const currencyLabel = readComponent(fixture, '.currency');
    expect(currencyLabel.innerText).toBe('MANA');

    expect(
      readComponent(fixture, '.block-title', 0).innerText
    ).toBe('90000');

    expect(
      readComponent(fixture, '.block-title', 1).innerText
    ).toBe('100659');
  });

  it('should render an ongoing loan', () => {
    const loan = new Loan(
      '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
      31,
      '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40',
      3,
      '0xe4d3ba99ffdae47c003f1756c01d8e7ee8fef7c9',
      '0x0679cde060990fb409cb19b4434714c1e5f2ae6e',
      20000,
      18418265,
      15552000000000,
      10367989632000,
      '0x4152530000000000000000000000000000000000000000000000000000000000',
      20000,
      0,
      0,
      0,
      0,
      0,
      1528675200000,
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000'
    );

    component.loan = loan;
    fixture.detectChanges();

    const lendButton = readComponent(fixture, 'app-lend-button');
    expect(lendButton).toBeFalsy();

    const detailButton = readComponent(fixture, 'app-detail-button');
    expect(detailButton).toBeDefined();

    const currencyLabel = readComponent(fixture, '.currency');
    expect(currencyLabel.innerText).toBe('ARS');

    expect(
      readComponent(fixture, '.block-title', 0).innerText
    ).toBe('200');

    expect(
      readComponent(fixture, '.block-title', 1).innerText
    ).toBe('0');
  });
});
