import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MatDialogModule } from '@angular/material';
import { SharedModule } from './../../../shared/shared.module';
import { WalletAvatarComponent } from './wallet-avatar.component';

describe('WalletAvatarComponent', () => {
  let component: WalletAvatarComponent;
  let fixture: ComponentFixture<WalletAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatSnackBarModule, MatDialogModule, SharedModule ],
      declarations: [ WalletAvatarComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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
