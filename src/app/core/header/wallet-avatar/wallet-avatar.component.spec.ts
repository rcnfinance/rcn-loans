import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAvatarComponent } from './wallet-avatar.component';

describe('WalletAvatarComponent', () => {
  let component: WalletAvatarComponent;
  let fixture: ComponentFixture<WalletAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
