import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationWalletBalancesComponent } from './notification-wallet-balances.component';

describe('NotificationWalletBalancesComponent', () => {
  let component: NotificationWalletBalancesComponent;
  let fixture: ComponentFixture<NotificationWalletBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationWalletBalancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationWalletBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
