import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';
// App Component
import { CreateLoanComponent } from './create-loan.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CreateLoanComponent
  ],
  exports: [
    CreateLoanComponent
  ]
})
export class CreateLoanModule { }
