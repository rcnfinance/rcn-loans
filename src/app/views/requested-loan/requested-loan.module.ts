import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Modules
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from './../../material/material.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { ApiService } from './../../services/api.service';
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
    NgxSpinnerService,
    ContractsService,
    ApiService
  ],
  exports: [
    RequestedLoanComponent
  ]
})
export class RequestedLoanModule { }
