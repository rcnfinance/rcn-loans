import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCreateCollateralComponent } from './step-create-collateral.component';

describe('StepCreateCollateralComponent', () => {
  let component: StepCreateCollateralComponent;
  let fixture: ComponentFixture<StepCreateCollateralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepCreateCollateralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCreateCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
