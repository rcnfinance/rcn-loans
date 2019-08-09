import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
import { CreateLoanComponent } from './create-loan.component';

describe('CreateLoanComponent', () => {
  let component: CreateLoanComponent;
  let fixture: ComponentFixture<CreateLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        SharedModule,
        MaterialModule,
        HttpClientModule
      ],
      declarations: [
        CreateLoanComponent
      ],
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
    fixture = TestBed.createComponent(CreateLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the installments amount', () => {
    component.installments = 1;
    component.annualInterest.patchValue(true);
    component.requestValue.patchValue(25);
    component.fullDuration.patchValue(30);
    expect(Number(component.expectedInstallmentAmount())).toEqual(25.0208);
  });

  it('should return days in the selected format', () => {
    const dayInSeconds: number = 24 * 60 * 60;
    expect(component.returnDaysAs(1, 'seconds')).toEqual(dayInSeconds);
    expect(component.returnDaysAs(7, 'seconds')).toEqual(dayInSeconds * 7);
  });
});
