import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
// App Modules
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from './../../material/material.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { ApiService } from './../../services/api.service';
import { FilterLoansService } from '../../services/filter-loans.service';
// App Component
import { RequestedLoanComponent } from './requested-loan.component';

const routes: Routes = [
  { path: '', component: RequestedLoanComponent }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RequestedLoanComponent
  ],
  providers: [
    NgxSpinnerService,
    ContractsService,
    ApiService,
    FilterLoansService
  ],
  exports: [
    RequestedLoanComponent
  ]
})
export class RequestedLoanModule { }
