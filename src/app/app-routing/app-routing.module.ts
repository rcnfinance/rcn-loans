import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App Components
import { RequestedLoanComponent } from '../views/requested-loan/requested-loan.component';
import { ActiveLoansComponent } from '../views/active-loans/active-loans.component';
import { AddressComponent } from '../views/address/address.component';
import { LoanDetailComponent } from '../views/loan-detail/loan-detail.component';
import { NotFoundModule } from '../views/not-found/not-found.module';
import { OverviewComponent } from '../views/overview/overview.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'requests', component: RequestedLoanComponent },
  { path: 'activity', component: ActiveLoansComponent },
  { path: 'loan/:id', component: LoanDetailComponent },
  { path: 'address/:address', component: AddressComponent },
  { path: 'overview/:id', component: OverviewComponent },
  { path: '404', component: NotFoundModule },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [
    NotFoundModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
