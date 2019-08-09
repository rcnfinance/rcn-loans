import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App Component
import { CreateLoanComponent } from '../create-loan.component';

const createRoutes: Routes = [
  { path: 'create', component: CreateLoanComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(createRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CreateLoanRoutingModule { }
