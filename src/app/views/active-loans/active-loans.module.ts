import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    MaterialModule,
    SharedModule
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
