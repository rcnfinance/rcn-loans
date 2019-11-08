import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../../shared/shared.module';

import { StepCreateCollateralComponent } from './step-create-collateral.component';

describe('StepCreateCollateralComponent', () => {
  let component: StepCreateCollateralComponent;
  let fixture: ComponentFixture<StepCreateCollateralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        BrowserAnimationsModule,
        HttpClientModule,
        SharedModule
      ],
      declarations: [ StepCreateCollateralComponent ],
      providers: [
        {
          provide: APP_BASE_HREF, useValue: '/'
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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
