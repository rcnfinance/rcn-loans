import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { InstallmentsService } from './../../services/installments.service';
import { CommitsService } from './../../services/commits.service';
import { LoanDetail2Component } from './loan-detail2.component';

describe('LoanDetail2Component', () => {
  let component: LoanDetail2Component;
  let fixture: ComponentFixture<LoanDetail2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanDetail2Component ],
      imports: [
        RouterModule.forRoot([]),
        HttpClientModule,
        NgxSpinnerModule,
        SharedModule
      ],
      providers: [ InstallmentsService, CommitsService ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDetail2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
