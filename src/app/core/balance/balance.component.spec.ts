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

  it('should display balance', async () => {
    const thisComponent: any = component;

    // set balance amount
    thisComponent.rcnBalance = 25000.789;
    thisComponent.rcnAvailable = 3000;
    thisComponent.basaltLoansWithBalance = ['743'];

    // update template
    await thisComponent.updateDisplay();
    fixture.detectChanges();

    // logic expect
    expect(thisComponent.displayBalance).toBe('25000.8');
    expect(thisComponent.displayAvailable).toBe('3000');
    expect(thisComponent.canWithdraw).toBeTruthy();

    // ui expect
    const withdrawPayments = readComponent(fixture, '.balance-withdraw__amount');
    expect(withdrawPayments).toBeDefined();

    const displayAvailable = Number(withdrawPayments.innerText);
    expect(displayAvailable).toBe(3000);
  });
});
