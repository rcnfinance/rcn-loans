import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Component
import { CreateLoanComponent } from './create-loan.component';
import { StepCreateLoanComponent } from './step-create-loan/step-create-loan.component';
import { CreateLoanCardComponent } from './create-loan-card/create-loan-card.component';
import { StepCreateCollateralComponent } from './step-create-collateral/step-create-collateral.component';

const routes: Routes = [
  { path: '', component: CreateLoanComponent },
  { path: ':id', component: CreateLoanComponent }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    CreateLoanComponent,
    StepCreateLoanComponent,
    CreateLoanCardComponent,
    StepCreateCollateralComponent
  ]
})
export class CreateLoanModule { }
