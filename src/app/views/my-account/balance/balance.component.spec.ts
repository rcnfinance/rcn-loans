import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'app/shared/shared.module';
import { readComponent } from 'app/utils/utils.test';
import { BalanceComponent } from './balance.component';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
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
    component.usdcLoansWithBalance = [3000];
    component.usdcAvailable = 3000;

    // update template
    component.updateDisplay();
    fixture.detectChanges();

    // logic expect
    expect(component.usdcDisplayAvailable).toBe('3,000.00');
    expect(component.usdcCanWithdraw).toBeTruthy();

    // ui expect
    const withdrawPayments = readComponent(fixture, '.balance__cta');
    expect(withdrawPayments).toBeDefined();
  });
});
