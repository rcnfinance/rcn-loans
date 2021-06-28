import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingTooltipComponent } from './onboarding-tooltip.component';

describe('OnboardingTourComponent', () => {
  let component: OnboardingTooltipComponent;
  let fixture: ComponentFixture<OnboardingTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
