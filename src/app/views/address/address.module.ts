import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
// App Component
import { BorrowedLoansComponent } from './borrowed-loans/borrowed-loans.component';
import { AddressComponent } from './lent-loans/lent-loans.component';
import { MyLoansTabsComponent } from './my-loans-tabs/my-loans-tabs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'borrowed'
  },
  {
    path: 'lent',
    component: AddressComponent
  },
  {
    path: 'borrowed',
    component: BorrowedLoansComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    BorrowedLoansComponent,
    AddressComponent,
    MyLoansTabsComponent
  ],
  providers: [
    ContractsService
  ]
})
export class AddressModule { }
