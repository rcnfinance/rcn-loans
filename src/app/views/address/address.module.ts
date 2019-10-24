import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
// App Component
import { AddressComponent } from './address.component';

const routes: Routes = [
  { path: '', component: AddressComponent }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AddressComponent
  ],
  providers: [
    ContractsService,
    AvailableLoansService
  ],
  exports: [
    AddressComponent
  ]
})
export class AddressModule { }
