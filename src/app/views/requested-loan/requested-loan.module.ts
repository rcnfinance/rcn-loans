import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';
import { ContractsService } from './../../services/contracts.service';
// App Modules
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from './../../material/material.module';
// App Component
import { RequestedLoanComponent } from './requested-loan.component';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    MaterialModule,
    SharedModule
  ],
  declarations: [
    RequestedLoanComponent
  ],
  providers: [
    ContractsService,
    NgxSpinnerService
  ],
  exports: [
    RequestedLoanComponent
  ]
})
export class RequestedLoanModule { }
