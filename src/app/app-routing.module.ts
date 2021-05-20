import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('./views/active-loans/active-loans.module').then(m => m.ActiveLoansModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'address/:address',
    loadChildren: () => import('./views/address/address.module').then(m => m.AddressModule)
  },
  {
    path: 'loan/:id',
    loadChildren: () => import('./views/loan-detail/loan-detail.module').then(m => m.LoanDetailModule),
    data: {
      hideMobileHeader: true
    }
  },
  {
    path: 'my-account',
    loadChildren: () => import('./views/my-account/my-account.module').then(m => m.MyAccountModule)
  },
  {
    path: 'lend',
    loadChildren: () => import('./views/requested-loan/requested-loan.module').then(m => m.RequestedLoanModule)
  },
  {
    path: 'borrow',
    loadChildren: () => import('./views/create-loan/create-loan.module').then(m => m.CreateLoanModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./views/faqs/faqs.module').then(m => m.FaqsModule)
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
