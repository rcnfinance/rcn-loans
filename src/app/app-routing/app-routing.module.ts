import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App Components
import { RequestedLoanComponent } from '../views/requested-loan/requested-loan.component';
import { ActiveLoansComponent } from '../views/active-loans/active-loans.component';
import { AddressComponent } from '../views/address/address.component';
import { MyLentLoansComponent } from '../views/address/my-lent-loans/my-lent-loans.component';
import { MyBorrowedLoansComponent } from '../views/address/my-borrowed-loans/my-borrowed-loans.component';
import { LoanDetailComponent } from '../views/loan-detail/loan-detail.component';
import { NotFoundModule } from '../views/not-found/not-found.module';
import { CreateLoanModule } from '../views/create-loan/create-loan.module';

const appRoutes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'create', component: CreateLoanModule },
  { path: 'requests', component: RequestedLoanComponent },
  { path: 'activity', component: ActiveLoansComponent },
  { path: 'loan/:id', component: LoanDetailComponent },
  { path: 'address/:address', component: AddressComponent,
    children: [
      {
        path: 'lent',
        component: MyLentLoansComponent
      },
      {
        path: 'borrowed',
        component: MyBorrowedLoansComponent
      }
    ]
  },
  { path: '404', component: NotFoundModule },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [
    NotFoundModule,
    CreateLoanModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
