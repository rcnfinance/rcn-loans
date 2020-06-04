import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'lend', pathMatch: 'full' },
  { path: 'requests', redirectTo: 'lend' }, // TODO: deprecate
  {
    path: 'activity',
    loadChildren: () => import('./views/active-loans/active-loans.module').then(m => m.ActiveLoansModule)
  },
  {
    path: 'address/:address',
    loadChildren: () => import('./views/address/address.module').then(m => m.AddressModule)
  },
  {
    path: 'loan/:id',
    loadChildren: () => import('./views/loan-detail/loan-detail.module').then(m => m.LoanDetailModule)
  },
  {
    path: 'lend',
    loadChildren: () => import('./views/requested-loan/requested-loan.module').then(m => m.RequestedLoanModule)
  },
  {
    path: 'create',
    loadChildren: () => import('./views/create-loan/create-loan.module').then(m => m.CreateLoanModule)
  },
  {
    path: '404',
    loadChildren: () => import('./views/not-found/not-found.module').then(m => m.NotFoundModule)
  },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
