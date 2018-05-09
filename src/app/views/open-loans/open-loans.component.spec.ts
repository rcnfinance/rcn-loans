import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenLoansComponent } from './open-loans.component';

describe('OpenLoansComponent', () => {
  let component: OpenLoansComponent;
  let fixture: ComponentFixture<OpenLoansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenLoansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
