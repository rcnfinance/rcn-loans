import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DashboardListItemComponent } from './dashboard-list-item.component';
import { MaterialModule } from '../..//material.module';
import { Engine, Loan, Status } from '../..//models/loan.model';
import { InstallmentsService } from '../../services/installments.service';
import { readComponent } from '../../utils/utils.test';

describe('DashboardListItemComponent', () => {
  let component: DashboardListItemComponent;
  let fixture: ComponentFixture<DashboardListItemComponent>;
  const loan = new Loan(
    Engine.RcnEngine,
    '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
    '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
    11000000000000000000,
    {
      'address': '0x0000000000000000000000000000000000000000',
      'currency': 'RCN',
      'code': '0x0000000000000000000000000000000000000000000000000000000000000000'
    },
    {
      'firstObligation': 1000000000000000000,
      'totalObligation': 12000000000000000000,
      'duration': 31104000,
      'interestRate': 9.048821548821541,
      'punitiveInterestRate': 11.976896418944936,
      'frequency': 2592000,
      'installments': 12
    },
    '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
    '0x06779a9848e5Df60ce0F5f63F88c5310C4c7289C',
    Status.Request,
    1677953062,
    '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF',
    '0x0000000000000000000000000000000000000000',
    {
      'id' : '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
      'model' : {
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
        'address' : '0x0000000000000000000000000000000000000000',
        'currency' : 'RCN',
        'code' : '0x0000000000000000000000000000000000000000000000000000000000000000'
      }
    }
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, HttpClientModule, RouterModule.forRoot([])],
      declarations: [DashboardListItemComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [InstallmentsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardListItemComponent);
    component = fixture.componentInstance;
    component.loan = loan;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct status text', () => {
    expect(component.getStatusTextByStatus()).toEqual('Collateral Pending');
  });

  it('should return correct color', () => {
    expect(component.getBorderColorByStatus()).toEqual('#A3A5A6');
  });

  it('should display borrowed label', () => {
    const expectedValue = component.borrowed;
    fixture.detectChanges();

    const value = readComponent(fixture, '#label-borrowed');
    expect(value.innerText).toBe(expectedValue);
  });

});
