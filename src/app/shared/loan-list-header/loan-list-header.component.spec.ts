import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanListHeaderComponent } from './loan-list-header.component';

describe('LoanListHeaderComponent', () => {
  let component: LoanListHeaderComponent;
  let fixture: ComponentFixture<LoanListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
