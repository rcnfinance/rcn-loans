import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App Components
import { RequestedLoanComponent } from '../views/requested-loan/requested-loan.component';
import { ActiveLoansComponent } from '../active-loans/active-loans.component';
import { LoanDetailComponent } from '../views/loan-detail/loan-detail.component';
import { AddressComponent } from '../views/address/address.component';
import { ProfileComponent } from '../views/profile/profile.component';
import { NotFoundModule } from '../not-found/not-found.module';
import { CreateLoanComponent } from '../views/create-loan/create-loan.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'requests', component: RequestedLoanComponent },
  { path: 'activity', component: ActiveLoansComponent },
  { path: 'loan/:id', component: LoanDetailComponent },
  { path: 'address/:address', component: AddressComponent },
  { path: 'profile', component: ProfileComponent },
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
