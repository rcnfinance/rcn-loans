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
import { ActiveLoansComponent } from './active-loans.component';

const routes: Routes = [
  { path: '', component: ActiveLoansComponent }
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
    ActiveLoansComponent
  ],
  providers: [
    ContractsService
  ],
  exports: [
    ActiveLoansComponent
  ]
})
export class ActiveLoansModule { }
