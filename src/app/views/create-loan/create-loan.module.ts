import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';
// App Modules
import { CreateLoanRoutingModule } from './create-loan-routing/create-loan-routing.module';
// App Component
import { CreateLoanComponent } from './create-loan.component';

@NgModule({
  imports: [
    CommonModule,
    CreateLoanRoutingModule
  ],
  declarations: [
    CreateLoanComponent
  ],
  providers: [
    // NgxSpinnerService
  ],
  exports: [
    CreateLoanRoutingModule
  ]
})
export class CreateLoanModule { }
