import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { FilterLoansService } from '../../services/filter-loans.service';
// App Component
import { RequestedLoanComponent } from './requested-loan.component';
import { NoAvailableLoansComponent } from './no-available-loans/no-available-loans.component';

const routes: Routes = [
  { path: '', component: RequestedLoanComponent }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RequestedLoanComponent,
    NoAvailableLoansComponent
  ],
  providers: [
    ContractsService,
    FilterLoansService
  ],
  exports: [
    RequestedLoanComponent
  ]
})
export class RequestedLoanModule { }
