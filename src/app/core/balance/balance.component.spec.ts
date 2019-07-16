import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
import { BalanceComponent } from './balance.component';
import { readComponent } from '../../utils/utils.test';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MaterialModule,
        HttpClientModule
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
    const withdrawPayments = readComponent(fixture, '.pending');
    expect(withdrawPayments).toBeDefined();

    const displayAvailable = Number(withdrawPayments.innerText.replace('add_circle', ''));
    expect(displayAvailable).toBe(3000);
  });

  it('should hide withdraw button', async(() => {
    const withdrawPayments = readComponent(fixture, '.pending');
    expect(withdrawPayments).toBeUndefined();
  }));
});
