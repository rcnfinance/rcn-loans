import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { RequestedLoanModule } from './views/requested-loan/requested-loan.module';
import { ActiveLoansModule } from './views/active-loans/active-loans.module';
import { AddressModule } from './views/address/address.module';
import { LoanDetail2Module } from './views/loan-detail2/loan-detail2.module';

import { AppComponent } from './app.component';

describe('App component', () => {
  beforeEach(async(() => {
    // The TestBed is the most important of the Angular testing utilities.
    // The TestBed creates a dynamically-constructed Angular test module that emulates an Angular @NgModule.
    // The TestBed.configureTestingModule() method takes a metadata object that can have most of the properties of an @NgModule.
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterModule,
        AppRoutingModule,
        CoreModule,
        RequestedLoanModule,
        ActiveLoansModule,
        AddressModule,
        LoanDetail2Module
      ],
      declarations: [AppComponent],
      providers: [

      ]
    }).compileComponents();
  }));
});
