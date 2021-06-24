import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingTourComponent } from './onboarding-tour.component';

describe('OnboardingTourComponent', () => {
  let component: OnboardingTourComponent;
  let fixture: ComponentFixture<OnboardingTourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingTourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
