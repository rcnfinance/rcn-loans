import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWalletSelectComponent } from './dialog-wallet-select.component';

describe('DialogWalletSelectComponent', () => {
  let component: DialogWalletSelectComponent;
  let fixture: ComponentFixture<DialogWalletSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogWalletSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWalletSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
