import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Modules
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from './../../material/material.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
// App Component
import { AddressComponent } from './address.component';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    MaterialModule,
    SharedModule
  ],
  declarations: [
    AddressComponent
  ],
  providers: [
    NgxSpinnerService,
    ContractsService,
    AvailableLoansService
  ],
  exports: [
    AddressComponent
  ]
})
export class AddressModule { }
