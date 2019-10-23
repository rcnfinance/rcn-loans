import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
// App Modules
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from './../../material/material.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from './../..//services/available-loans.service';
// App Component
import { ActiveLoansComponent } from './active-loans.component';

const routes: Routes = [
  { path: '', component: ActiveLoansComponent }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    MaterialModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ActiveLoansComponent
  ],
  providers: [
    NgxSpinnerService,
    ContractsService,
    AvailableLoansService
  ],
  exports: [
    ActiveLoansComponent
  ]
})
export class ActiveLoansModule { }
