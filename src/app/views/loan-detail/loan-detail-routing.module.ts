import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App Component
import { LoanDetailComponent } from './loan-detail.component';

const routes: Routes = [
  { path: 'loan/:id', component: LoanDetailComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class LoanDetailRoutingModule { }
