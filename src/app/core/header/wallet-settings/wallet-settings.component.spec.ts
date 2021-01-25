import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSettingsComponent } from './wallet-settings.component';

describe('WalletSettingsComponent', () => {
  let component: WalletSettingsComponent;
  let fixture: ComponentFixture<WalletSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
