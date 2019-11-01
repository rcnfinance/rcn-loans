import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanCardComponent } from './create-loan-card.component';

describe('CreateLoanCardComponent', () => {
  let component: CreateLoanCardComponent;
  let fixture: ComponentFixture<CreateLoanCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLoanCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLoanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
