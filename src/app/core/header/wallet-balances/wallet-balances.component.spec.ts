import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../shared/shared.module';
import { WalletBalancesComponent } from './wallet-balances.component';
import { NotificationsService } from '../../../services/notifications.service';

describe('WalletBalancesComponent', () => {
  let component: WalletBalancesComponent;
  let fixture: ComponentFixture<WalletBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SharedModule
      ],
      declarations: [
        WalletBalancesComponent
      ],
      providers: [
        NotificationsService
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
