import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App Components
import { OpenLoansComponent } from '../views/open-loans/open-loans.component';
import { ActiveLoansComponent } from '../active-loans/active-loans.component';
import { LoanDetailComponent } from '../views/loan-detail/loan-detail.component';
import { AddressComponent } from '../views/address/address.component';
import { ProfileComponent } from '../views/profile/profile.component';
import { NotFoundModule } from '../not-found/not-found.module';
import { RequestLoanComponent } from '../views/request-loan/request-loan.component';

const appRoutes: Routes = [
  { path: 'requests', component: OpenLoansComponent },
  { path: 'request', component: RequestLoanComponent },
  { path: 'activity', component: ActiveLoansComponent },
  { path: 'loan/:id', component: LoanDetailComponent },
  { path: 'address/:address', component: AddressComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '404', component: NotFoundModule },
  { path: '', redirectTo: '/requests', pathMatch: 'full'},
  { path: '**',  redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
