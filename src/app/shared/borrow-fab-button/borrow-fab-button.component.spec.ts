import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowFabButtonComponent } from './borrow-fab-button.component';

describe('BorrowFabButtonComponent', () => {
  let component: BorrowFabButtonComponent;
  let fixture: ComponentFixture<BorrowFabButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BorrowFabButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowFabButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
