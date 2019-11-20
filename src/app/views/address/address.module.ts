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
import { AddressComponent } from './address.component';
import { MyLoansTabsComponent } from './my-loans-tabs/my-loans-tabs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lent'
  },
  {
    path: ':tab',
    component: AddressComponent
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
    AddressComponent,
    MyLoansTabsComponent
  ],
  providers: [
    ContractsService
  ]
})
export class AddressModule { }
