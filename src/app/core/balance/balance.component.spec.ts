import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { BalanceComponent } from './balance.component';
import { readComponent } from '../../utils/utils.test';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        SharedModule
      ],
      declarations: [ BalanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display balance', () => {
    // set balance amount
    component.rcnLoansWithBalance = [3000];
    component.rcnAvailable = 3000;

    // update template
    component.updateDisplay();
    fixture.detectChanges();

    // logic expect
    expect(component.rcnDisplayAvailable).toBe('3,000.00');
    expect(component.rcnCanWithdraw).toBeTruthy();

    // ui expect
    const withdrawPayments = readComponent(fixture, '.balance-withdraw__amount');
    expect(withdrawPayments).toBeDefined();
  });
});
