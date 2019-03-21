import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogClientWalletComponent } from './dialog-client-wallet.component';

describe('DialogClientWalletComponent', () => {
  let component: DialogClientWalletComponent;
  let fixture: ComponentFixture<DialogClientWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogClientWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogClientWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
