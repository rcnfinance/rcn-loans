import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDoesNotExistComponent } from './loan-does-not-exist.component';

describe('LoanDoesNotExistComponent', () => {
  let component: LoanDoesNotExistComponent;
  let fixture: ComponentFixture<LoanDoesNotExistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanDoesNotExistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDoesNotExistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
