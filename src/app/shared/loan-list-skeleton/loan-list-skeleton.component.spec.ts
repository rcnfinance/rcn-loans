import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanListSkeletonComponent } from './loan-list-skeleton.component';

describe('LoanListSkeletonComponent', () => {
  let component: LoanListSkeletonComponent;
  let fixture: ComponentFixture<LoanListSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanListSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanListSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
