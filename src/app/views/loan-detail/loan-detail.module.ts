import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Component
import { LoanDetailRoutingModule } from './loan-detail-routing.module';
import { LoanDetailComponent } from './loan-detail.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';

@NgModule({
  imports: [
    CommonModule,
    LoanDetailRoutingModule,
  ],
  declarations: []
})
export class LoanDetailModule { }
