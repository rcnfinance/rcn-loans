import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WalletAvatarComponent } from './wallet-avatar.component';

describe('WalletAvatarComponent', () => {
  let component: WalletAvatarComponent;
  let fixture: ComponentFixture<WalletAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatSnackBarModule, MatDialogModule, MatTooltipModule ],
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
