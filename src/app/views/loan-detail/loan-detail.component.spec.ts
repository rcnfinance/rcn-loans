import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDetailComponent } from './loan-detail.component';

describe('LoanDetailComponent', () => {
  let component: LoanDetailComponent;
  let fixture: ComponentFixture<LoanDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
