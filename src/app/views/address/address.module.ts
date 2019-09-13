import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// App Modules
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from './../../material/material.module';
// import { AppRoutingModule } from '../../app-routing/app-routing.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
// App Component
import { AddressComponent } from './address.component';
import { MyLentLoansComponent } from './my-lent-loans/my-lent-loans.component';
import { MyBorrowedLoansComponent } from './my-borrowed-loans/my-borrowed-loans.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    NgxSpinnerModule,
    MaterialModule,
    SharedModule
    // AppRoutingModule
  ],
  declarations: [
    AddressComponent,
    MyLentLoansComponent,
    MyBorrowedLoansComponent
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
