import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Modules
import { NgxSpinnerModule } from 'ngx-spinner';
import { CreateLoanRoutingModule } from './create-loan-routing/create-loan-routing.module';
// App Component
import { CreateLoanComponent } from './create-loan.component';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    CreateLoanRoutingModule
  ],
  declarations: [
    CreateLoanComponent
  ]
})
export class CreateLoanModule { }
