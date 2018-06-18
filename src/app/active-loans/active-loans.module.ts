import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Component
import { ActiveLoansComponent } from './active-loans.component';
// App Services
import { ContractsService } from './../services/contracts.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ActiveLoansComponent],
  providers: [
    ContractsService,
  ]
})
export class ActiveLoansModule { }
